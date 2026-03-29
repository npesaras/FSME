import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAccountsService } from './accounts-service.server'

function createAppwriteUser(overrides: Record<string, unknown> = {}) {
  return {
    $id: 'user-1',
    $createdAt: '2026-03-29T00:00:00.000Z',
    $updatedAt: '2026-03-29T00:00:00.000Z',
    name: 'Jane Faculty',
    email: 'jane@example.com',
    registration: '2026-03-29T00:00:00.000Z',
    status: true,
    labels: [],
    passwordUpdate: '2026-03-29T00:00:00.000Z',
    phone: '',
    emailVerification: true,
    phoneVerification: false,
    mfa: false,
    prefs: {},
    targets: [],
    accessedAt: '2026-03-29T00:00:00.000Z',
    ...overrides,
  }
}

function createDeps() {
  const users = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    createScryptUser: vi.fn(),
    updateStatus: vi.fn(),
    updateLabels: vi.fn(),
    updatePrefs: vi.fn(),
  }
  const adminAccount = {
    createEmailPasswordSession: vi.fn(),
  }
  const authAccount = {
    createRecovery: vi.fn(),
    updateRecovery: vi.fn(),
  }
  const sessionAccount = {
    get: vi.fn(),
    deleteSession: vi.fn(),
  }
  const tablesDB = {
    listRows: vi.fn(),
    getRow: vi.fn(),
  }

  const service = createAccountsService({
    users,
    createAdminAccount: () => adminAccount,
    createAuthAccount: () => authAccount,
    createSessionAccount: () => sessionAccount,
    tablesDB,
    databaseId: 'db-1',
    tableId: 'accounts',
    recoveryOrigins: ['http://127.0.0.1:3000'],
    logger: { warn: vi.fn() },
  })

  return {
    service,
    users,
    adminAccount,
    authAccount,
    sessionAccount,
    tablesDB,
  }
}

describe('createAccountsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults new sign-ups to the faculty role', async () => {
    const { service, users, adminAccount, tablesDB } = createDeps()
    const createdUser = createAppwriteUser()

    users.list
      .mockResolvedValueOnce({ users: [] })
      .mockResolvedValue({ users: [createdUser] })
    tablesDB.listRows.mockResolvedValue({ rows: [], total: 0 })
    users.create.mockResolvedValue(createdUser)
    users.updateLabels.mockResolvedValue(createdUser)
    users.updatePrefs.mockResolvedValue(createdUser)
    adminAccount.createEmailPasswordSession.mockResolvedValue({
      secret: 'session-secret',
      expire: '2026-04-01T00:00:00.000Z',
    })

    const result = await service.signUp({
      name: 'Jane Faculty',
      email: 'jane@example.com',
      password: 'secret-password',
    })

    expect(result.account.role).toBe('faculty')
    expect(users.updateLabels).toHaveBeenCalledWith({
      userId: 'user-1',
      labels: ['faculty'],
    })
    expect(users.updatePrefs).toHaveBeenCalledWith({
      userId: 'user-1',
      prefs: { role: 'faculty' },
    })
  })

  it('imports a legacy account on sign-in when no Appwrite auth user exists', async () => {
    const { service, users, adminAccount, tablesDB } = createDeps()
    const legacyAccount = {
      $id: 'legacy-1',
      email: 'legacy@example.com',
      name: 'Legacy Panelist',
      passwordHash: 'scrypt$salt$hash',
      role: 'panelist',
      status: 'active',
    }
    const importedUser = createAppwriteUser({
      $id: 'legacy-1',
      email: 'legacy@example.com',
      name: 'Legacy Panelist',
    })

    users.list
      .mockResolvedValueOnce({ users: [] })
      .mockResolvedValueOnce({ users: [] })
    users.get.mockRejectedValue({ code: 404 })
    tablesDB.listRows.mockResolvedValue({ rows: [legacyAccount], total: 1 })
    users.createScryptUser.mockResolvedValue(importedUser)
    users.updateLabels.mockResolvedValue(importedUser)
    users.updatePrefs.mockResolvedValue(importedUser)
    adminAccount.createEmailPasswordSession.mockResolvedValue({
      secret: 'session-secret',
      expire: '2026-04-01T00:00:00.000Z',
    })

    const result = await service.signIn({
      email: 'legacy@example.com',
      password: 'legacy-password',
    })

    expect(result.account.role).toBe('panelist')
    expect(users.createScryptUser).toHaveBeenCalled()
    expect(users.updateLabels).toHaveBeenCalledWith({
      userId: 'legacy-1',
      labels: ['panelist'],
    })
  })

  it('returns a clean invalid-credentials error for wrong passwords', async () => {
    const { service, users, adminAccount, tablesDB } = createDeps()

    users.list.mockResolvedValue({ users: [] })
    tablesDB.listRows.mockResolvedValue({ rows: [], total: 0 })
    adminAccount.createEmailPasswordSession.mockRejectedValue({ code: 401 })

    await expect(
      service.signIn({
        email: 'missing@example.com',
        password: 'wrong-password',
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    })
  })

  it('resolves the current account role from Appwrite labels', async () => {
    const { service, users, sessionAccount, tablesDB } = createDeps()
    const panelistUser = createAppwriteUser({
      $id: 'panel-1',
      labels: ['panelist'],
      prefs: { role: 'panelist' },
    })

    sessionAccount.get.mockResolvedValue(panelistUser)
    users.get.mockResolvedValue(panelistUser)
    tablesDB.getRow.mockRejectedValue({ code: 404 })

    const account = await service.getCurrentAccount('session-secret')

    expect(account.role).toBe('panelist')
    expect(account.email).toBe('jane@example.com')
  })

  it('returns the generic forgot-password message when no account exists', async () => {
    const { service, users, authAccount, tablesDB } = createDeps()

    users.list.mockResolvedValue({ users: [] })
    tablesDB.listRows.mockResolvedValue({ rows: [], total: 0 })

    const response = await service.forgotPassword({
      email: 'missing@example.com',
      origin: 'http://127.0.0.1:3000',
    })

    expect(response.message).toBe(
      'If an account exists for that email, reset instructions have been sent.'
    )
    expect(authAccount.createRecovery).not.toHaveBeenCalled()
  })

  it('returns an invalid recovery error when the reset link is expired', async () => {
    const { service, authAccount } = createDeps()

    authAccount.updateRecovery.mockRejectedValue({ code: 401 })

    await expect(
      service.resetPassword({
        userId: 'user-1',
        secret: 'expired-secret',
        password: 'new-password',
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RECOVERY',
      message: 'This password reset link is invalid or has expired.',
    })
  })

  it('treats unauthorized sign-out as a successful logout', async () => {
    const { service, sessionAccount } = createDeps()

    sessionAccount.deleteSession.mockRejectedValue({ code: 401 })

    await expect(service.signOut('session-secret')).resolves.toEqual({
      message: 'Signed out successfully.',
    })
  })
})
