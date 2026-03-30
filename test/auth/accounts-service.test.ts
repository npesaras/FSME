import type { Models } from 'node-appwrite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAccountsService } from '../../src/server/features/auth/accounts-service.server'

function createUser(
  overrides: Partial<Models.User<Record<string, unknown>>> = {},
): Models.User<Record<string, unknown>> {
  return {
    $id: 'user-1',
    $createdAt: '2026-03-30T00:00:00.000Z',
    $updatedAt: '2026-03-30T00:00:00.000Z',
    accessedAt: '2026-03-30T00:00:00.000Z',
    registration: '2026-03-30T00:00:00.000Z',
    status: true,
    labels: ['faculty'],
    passwordUpdate: '2026-03-30T00:00:00.000Z',
    name: 'Faculty User',
    password: true,
    hash: 'argon2',
    hashOptions: {},
    email: 'faculty@example.com',
    phone: '',
    emailVerification: true,
    phoneVerification: false,
    mfa: false,
    prefs: { role: 'faculty' },
    targets: [],
    accessedBy: null,
    ...overrides,
  } as Models.User<Record<string, unknown>>
}

function createTestService() {
  const users = {
    list: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    updateStatus: vi.fn(),
    updateLabels: vi.fn(),
    updatePrefs: vi.fn(),
  }
  const adminAccount = {
    createEmailPasswordSession: vi.fn(),
  }
  const authAccount = {
    create: vi.fn(),
    createRecovery: vi.fn(),
    updateEmailVerification: vi.fn(),
    updateRecovery: vi.fn(),
  }
  const sessionAccount = {
    get: vi.fn(),
    createEmailVerification: vi.fn(),
    deleteSession: vi.fn(),
  }
  const tablesDB = {
    listRows: vi.fn(),
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
  }

  const service = createAccountsService({
    users,
    createAdminAccount: () => adminAccount,
    createAuthAccount: () => authAccount,
    createSessionAccount: () => sessionAccount,
    tablesDB,
    databaseId: 'main',
    userProfilesTableId: 'user_profiles',
    recoveryOrigins: ['http://localhost:3000'],
    verificationOrigins: ['http://localhost:3000'],
    logger: console,
  })

  return {
    adminAccount,
    authAccount,
    service,
    sessionAccount,
    tablesDB,
    users,
  }
}

describe('accounts service verification flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('signs users up without creating an app session and sends a verification email', async () => {
    const { adminAccount, authAccount, service, sessionAccount, tablesDB, users } =
      createTestService()

    users.list.mockResolvedValue({ users: [] })
    authAccount.create.mockResolvedValue(createUser({ emailVerification: false, labels: [], prefs: {} }))
    users.updateLabels.mockResolvedValue({})
    users.updatePrefs.mockResolvedValue({})
    adminAccount.createEmailPasswordSession.mockResolvedValue({
      secret: 'temp-session-secret',
      expire: '2026-03-31T00:00:00.000Z',
    })
    sessionAccount.createEmailVerification.mockResolvedValue({})
    sessionAccount.deleteSession.mockResolvedValue({})

    await expect(
      service.signUp({
        name: 'Faculty User',
        email: 'faculty@example.com',
        password: 'secure-password',
        origin: 'http://localhost:3000',
      }),
    ).resolves.toMatchObject({
      email: 'faculty@example.com',
      verificationRequired: true,
    })

    expect(sessionAccount.createEmailVerification).toHaveBeenCalledWith({
      url: 'http://localhost:3000/verify-email',
    })
    expect(sessionAccount.deleteSession).toHaveBeenCalledWith({
      sessionId: 'current',
    })
    expect(tablesDB.createRow).not.toHaveBeenCalled()
  })

  it('blocks sign-in for unverified users and resends verification', async () => {
    const { adminAccount, service, sessionAccount, tablesDB } = createTestService()

    adminAccount.createEmailPasswordSession.mockResolvedValue({
      secret: 'temp-session-secret',
      expire: '2026-03-31T00:00:00.000Z',
    })
    sessionAccount.get.mockResolvedValue(createUser({ emailVerification: false }))
    sessionAccount.createEmailVerification.mockResolvedValue({})
    sessionAccount.deleteSession.mockResolvedValue({})

    await expect(
      service.signIn({
        email: 'faculty@example.com',
        password: 'secure-password',
        origin: 'http://localhost:3000',
      }),
    ).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
      statusCode: 403,
    })

    expect(sessionAccount.createEmailVerification).toHaveBeenCalledWith({
      url: 'http://localhost:3000/verify-email',
    })
    expect(sessionAccount.deleteSession).toHaveBeenCalledWith({
      sessionId: 'current',
    })
    expect(tablesDB.createRow).not.toHaveBeenCalled()
  })

  it('returns invalid-credentials when the email does not exist', async () => {
    const { adminAccount, service, users } = createTestService()

    adminAccount.createEmailPasswordSession.mockRejectedValue({
      code: 401,
      type: 'user_invalid_credentials',
    })

    await expect(
      service.signIn({
        email: 'missing@example.com',
        password: 'secure-password',
        origin: 'http://localhost:3000',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    })

    expect(users.list).not.toHaveBeenCalled()
  })

  it('completes email verification and creates the verified user profile row', async () => {
    const { authAccount, service, tablesDB, users } = createTestService()

    authAccount.updateEmailVerification.mockResolvedValue({})
    users.get.mockResolvedValue(createUser())
    tablesDB.listRows.mockResolvedValue({ rows: [], total: 0 })
    tablesDB.createRow.mockResolvedValue({
      $id: 'profile-1',
      user_id: 'user-1',
      full_name: 'Faculty User',
      role: 'faculty',
    })

    await expect(
      service.completeEmailVerification({
        userId: 'user-1',
        secret: 'verification-secret',
      }),
    ).resolves.toMatchObject({
      message: 'Email verified successfully. You can now sign in.',
    })

    expect(tablesDB.createRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'user_profiles',
      rowId: expect.any(String),
      data: {
        user_id: 'user-1',
        full_name: 'Faculty User',
        role: 'faculty',
      },
    })
  })

  it('treats unverified current sessions as unauthenticated and clears them', async () => {
    const { service, sessionAccount } = createTestService()

    sessionAccount.get.mockResolvedValue(createUser({ emailVerification: false }))
    sessionAccount.deleteSession.mockResolvedValue({})

    await expect(service.getCurrentAccount('temp-session-secret')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 401,
    })

    expect(sessionAccount.deleteSession).toHaveBeenCalledWith({
      sessionId: 'current',
    })
  })

  it('deletes the current account and mirrored user profile', async () => {
    const { service, sessionAccount, tablesDB, users } = createTestService()

    sessionAccount.get.mockResolvedValue(createUser())
    tablesDB.listRows.mockResolvedValue({
      rows: [
        {
          $id: 'profile-1',
          user_id: 'user-1',
          full_name: 'Faculty User',
          role: 'faculty',
        },
      ],
      total: 1,
    })
    tablesDB.deleteRow.mockResolvedValue({})
    users.delete.mockResolvedValue({})

    await expect(service.deleteCurrentAccount('active-session-secret')).resolves.toMatchObject({
      message: 'Your account has been deleted successfully.',
    })

    expect(tablesDB.deleteRow).toHaveBeenCalledWith({
      databaseId: 'main',
      tableId: 'user_profiles',
      rowId: 'profile-1',
    })
    expect(users.delete).toHaveBeenCalledWith({
      userId: 'user-1',
    })
  })
})
