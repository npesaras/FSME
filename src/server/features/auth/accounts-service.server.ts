import { ID, Query, type Models } from 'node-appwrite'
import type { AuthAccount, AuthMessageResponse, AuthRole, AuthSession } from '#/features/auth/types'
import { AppError } from '../../shared/errors.server'
import type { ServerLogger } from '../../types/logger'
import {
  createLegacyAccountsRepository,
  normalizeEmail,
  normalizeName,
  parseLegacyScryptHash,
  type LegacyAccount,
} from './legacy-accounts.server'

const APP_ROLES: AuthRole[] = ['faculty', 'panelist']
const DEFAULT_APP_ROLE: AuthRole = 'faculty'

type AppwriteUser = Models.User<Record<string, unknown>>

type AccountsServiceDependencies = {
  users: {
    list: (options: { queries?: string[] }) => Promise<{ users: AppwriteUser[] }>
    get: (options: { userId: string }) => Promise<AppwriteUser>
    create: (options: {
      userId: string
      email: string
      password: string
      name: string
    }) => Promise<AppwriteUser>
    createScryptUser: (options: {
      userId: string
      email: string
      password: string
      passwordSalt: string
      passwordCpu: number
      passwordMemory: number
      passwordParallel: number
      passwordLength: number
      name: string
    }) => Promise<AppwriteUser>
    updateStatus: (options: { userId: string; status: boolean }) => Promise<AppwriteUser>
    updateLabels: (options: { userId: string; labels: string[] }) => Promise<AppwriteUser>
    updatePrefs: (options: {
      userId: string
      prefs: Record<string, unknown>
    }) => Promise<AppwriteUser>
  }
  createAdminAccount: () => {
    createEmailPasswordSession: (options: {
      email: string
      password: string
    }) => Promise<{ secret?: string; expire?: string }>
  }
  createAuthAccount: () => {
    createRecovery: (options: { email: string; url: string }) => Promise<unknown>
    updateRecovery: (options: {
      userId: string
      secret: string
      password: string
    }) => Promise<unknown>
  }
  createSessionAccount: (sessionSecret: string) => {
    get: () => Promise<AppwriteUser>
    deleteSession: (options: { sessionId: string }) => Promise<unknown>
  }
  tablesDB: {
    listRows: (options: {
      databaseId: string
      tableId: string
      queries?: string[]
    }) => Promise<{ rows: unknown[]; total: number }>
    getRow: (options: {
      databaseId: string
      tableId: string
      rowId: string
    }) => Promise<unknown>
  }
  databaseId: string
  tableId: string
  recoveryOrigins: string[]
  logger?: ServerLogger
}

function normalizeOrigin(origin: string) {
  try {
    return new URL(String(origin)).origin
  } catch {
    return null
  }
}

function isAppwriteErrorWithCode(error: unknown, expectedCode: number) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === expectedCode
}

function normalizeRole(role: unknown): AuthRole | null {
  if (typeof role !== 'string') {
    return null
  }

  const normalizedRole = role.trim().toLowerCase()

  return APP_ROLES.includes(normalizedRole as AuthRole) ? (normalizedRole as AuthRole) : null
}

function getAppRoleLabels(user: AppwriteUser) {
  return Array.isArray(user.labels)
    ? user.labels.filter((label): label is AuthRole => APP_ROLES.includes(label as AuthRole))
    : []
}

function getAppRole(user: AppwriteUser, legacyAccount: LegacyAccount | null = null): AuthRole {
  const labelRole = getAppRoleLabels(user)[0]

  if (labelRole) {
    return labelRole
  }

  const prefsRole = normalizeRole(user.prefs?.role)

  if (prefsRole) {
    return prefsRole
  }

  const legacyRole = normalizeRole(legacyAccount?.role)

  if (legacyRole) {
    return legacyRole
  }

  return DEFAULT_APP_ROLE
}

function toPublicAccount(user: AppwriteUser, legacyAccount: LegacyAccount | null = null): AuthAccount {
  return {
    id: user.$id,
    name: user.name,
    email: user.email,
    role: getAppRole(user, legacyAccount),
    status: user.status ? 'active' : 'disabled',
    lastSignInAt: user.accessedAt || null,
    createdAt: user.$createdAt,
    updatedAt: user.$updatedAt,
  }
}

export function createAccountsService({
  users,
  createAdminAccount,
  createAuthAccount,
  createSessionAccount,
  tablesDB,
  databaseId,
  tableId,
  recoveryOrigins,
  logger,
}: AccountsServiceDependencies) {
  const legacyAccounts = createLegacyAccountsRepository({
    tablesDB,
    databaseId,
    tableId,
    logger,
  })
  const allowedRecoveryOrigins = new Set(
    recoveryOrigins.map((origin) => normalizeOrigin(origin)).filter(Boolean)
  )

  function assertRecoveryOrigin(origin: string) {
    const normalizedOrigin = normalizeOrigin(origin)

    if (!normalizedOrigin || !allowedRecoveryOrigins.has(normalizedOrigin)) {
      throw new AppError(400, 'Password recovery is not available from this origin.', {
        code: 'INVALID_RECOVERY_ORIGIN',
      })
    }

    return `${normalizedOrigin}/reset-password`
  }

  function logLegacyConflict(
    appwriteUser: AppwriteUser | null,
    legacyAccount: LegacyAccount | null,
    context: string
  ) {
    if (!appwriteUser || !legacyAccount || appwriteUser.$id === legacyAccount.$id) {
      return false
    }

    logger?.warn?.(
      {
        context,
        email: legacyAccount.email,
        appwriteUserId: appwriteUser.$id,
        legacyAccountId: legacyAccount.$id,
      },
      'Found mismatched legacy and Appwrite Auth account IDs for the same email. Preferring the Appwrite Auth user.'
    )

    return true
  }

  async function syncAppRoleMetadata(user: AppwriteUser, legacyAccount: LegacyAccount | null = null) {
    const targetRole = getAppRole(user, legacyAccount)
    const existingLabels = Array.isArray(user.labels) ? user.labels : []
    const nonRoleLabels = existingLabels.filter((label) => !APP_ROLES.includes(label as AuthRole))
    const nextLabels = [...nonRoleLabels, targetRole]
    const hasMatchingLabels =
      existingLabels.length === nextLabels.length &&
      existingLabels.every((label, index) => label === nextLabels[index])
    const existingPrefs =
      user.prefs && typeof user.prefs === 'object' && !Array.isArray(user.prefs)
        ? user.prefs
        : {}
    const hasMatchingPrefs = existingPrefs.role === targetRole

    if (hasMatchingLabels && hasMatchingPrefs) {
      return {
        ...user,
        labels: nextLabels,
        prefs: existingPrefs,
      }
    }

    await Promise.all([
      hasMatchingLabels
        ? Promise.resolve()
        : users.updateLabels({
            userId: user.$id,
            labels: nextLabels,
          }),
      hasMatchingPrefs
        ? Promise.resolve()
        : users.updatePrefs({
            userId: user.$id,
            prefs: {
              ...existingPrefs,
              role: targetRole,
            },
          }),
    ])

    return {
      ...user,
      labels: nextLabels,
      prefs: {
        ...existingPrefs,
        role: targetRole,
      },
    }
  }

  async function findAuthUserByEmail(email: string) {
    const result = await users.list({
      queries: [Query.equal('email', normalizeEmail(email)), Query.limit(1)],
    })

    return result.users[0] || null
  }

  async function getAuthUserById(accountId: string) {
    try {
      return await users.get({
        userId: accountId,
      })
    } catch (error) {
      if (isAppwriteErrorWithCode(error, 404)) {
        return null
      }

      throw error
    }
  }

  async function importLegacyAccount(legacyAccount: LegacyAccount) {
    const existingById = await getAuthUserById(legacyAccount.$id)

    if (existingById) {
      return existingById
    }

    const existingByEmail = await findAuthUserByEmail(legacyAccount.email)

    if (existingByEmail) {
      logLegacyConflict(existingByEmail, legacyAccount, 'import-legacy-account')
      return existingByEmail
    }

    const password = parseLegacyScryptHash(legacyAccount.passwordHash)
    let importedUser

    try {
      importedUser = await users.createScryptUser({
        userId: legacyAccount.$id,
        email: normalizeEmail(legacyAccount.email),
        password: password.password,
        passwordSalt: password.passwordSalt,
        passwordCpu: password.passwordCpu,
        passwordMemory: password.passwordMemory,
        passwordParallel: password.passwordParallel,
        passwordLength: password.passwordLength,
        name: normalizeName(legacyAccount.name),
      })
    } catch (error) {
      if (isAppwriteErrorWithCode(error, 409)) {
        const racedUser = await findAuthUserByEmail(legacyAccount.email)

        if (racedUser) {
          logLegacyConflict(racedUser, legacyAccount, 'import-legacy-account-race')
          return racedUser
        }
      }

      throw error
    }

    if (legacyAccount.status && legacyAccount.status !== 'active') {
      importedUser = await users.updateStatus({
        userId: importedUser.$id,
        status: false,
      })
    }

    return syncAppRoleMetadata(importedUser, legacyAccount)
  }

  async function ensureAuthUserByEmail(email: string) {
    const normalized = normalizeEmail(email)
    const [appwriteUser, legacyAccount] = await Promise.all([
      findAuthUserByEmail(normalized),
      legacyAccounts.findByEmail(normalized),
    ])

    if (appwriteUser) {
      logLegacyConflict(appwriteUser, legacyAccount, 'ensure-auth-user-by-email')
      return syncAppRoleMetadata(appwriteUser, legacyAccount)
    }

    if (!legacyAccount) {
      return null
    }

    return importLegacyAccount(legacyAccount)
  }

  async function ensureAuthUserById(accountId: string) {
    const [appwriteUser, legacyAccount] = await Promise.all([
      getAuthUserById(accountId),
      legacyAccounts.findById(accountId),
    ])

    if (appwriteUser) {
      return syncAppRoleMetadata(appwriteUser, legacyAccount)
    }

    if (!legacyAccount) {
      return null
    }

    return importLegacyAccount(legacyAccount)
  }

  async function checkEmailExists(email: string) {
    const normalizedEmail = normalizeEmail(email)
    const [appwriteUser, legacyAccount] = await Promise.all([
      findAuthUserByEmail(normalizedEmail),
      legacyAccounts.findByEmail(normalizedEmail),
    ])

    if (appwriteUser) {
      logLegacyConflict(appwriteUser, legacyAccount, 'check-email-exists')
      return true
    }

    return Boolean(legacyAccount)
  }

  async function getAccountBySessionSecret(sessionSecret: string) {
    try {
      const account = createSessionAccount(sessionSecret)
      const user = await account.get()

      return {
        account,
        user,
      }
    } catch (error) {
      if (isAppwriteErrorWithCode(error, 401) || isAppwriteErrorWithCode(error, 404)) {
        throw new AppError(401, 'Authentication required.', {
          code: 'UNAUTHORIZED',
        })
      }

      throw error
    }
  }

  async function createSessionForCredentials({
    email,
    password,
  }: {
    email: string
    password: string
  }): Promise<AuthSession & { session: { secret: string; expire: string } }> {
    const normalizedEmail = normalizeEmail(email)
    const user = await ensureAuthUserByEmail(normalizedEmail)
    let session

    try {
      const account = createAdminAccount()
      session = await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      })
    } catch (error) {
      if (isAppwriteErrorWithCode(error, 401) || isAppwriteErrorWithCode(error, 404)) {
        throw new AppError(401, 'Invalid email or password.', {
          code: 'INVALID_CREDENTIALS',
        })
      }

      throw error
    }

    if (!session?.secret || !session?.expire) {
      throw new AppError(500, 'We could not finish creating your sign-in session. Please try again.', {
        code: 'SESSION_CREATION_FAILED',
      })
    }

    if (!user) {
      throw new AppError(401, 'We could not find an account for that email address.', {
        code: 'INVALID_CREDENTIALS',
      })
    }

    return {
      account: toPublicAccount(user),
      session: {
        secret: session.secret,
        expire: session.expire,
      },
    }
  }

  return {
    async checkEmailExists({ email }: { email: string }) {
      return {
        exists: await checkEmailExists(email),
      }
    },

    async signUp({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }): Promise<AuthSession & { session: { secret: string; expire: string } }> {
      const normalizedEmail = normalizeEmail(email)
      const normalizedName = normalizeName(name)
      const [existingUser, legacyAccount] = await Promise.all([
        findAuthUserByEmail(normalizedEmail),
        legacyAccounts.findByEmail(normalizedEmail),
      ])

      if (existingUser || legacyAccount) {
        throw new AppError(409, 'An account with that email already exists.', {
          code: 'EMAIL_TAKEN',
        })
      }

      try {
        const createdUser = await users.create({
          userId: ID.unique(),
          email: normalizedEmail,
          password,
          name: normalizedName,
        })

        await syncAppRoleMetadata(createdUser)

        return createSessionForCredentials({
          email: normalizedEmail,
          password,
        })
      } catch (error) {
        if (isAppwriteErrorWithCode(error, 409)) {
          throw new AppError(409, 'An account with that email already exists.', {
            code: 'EMAIL_TAKEN',
          })
        }

        throw error
      }
    },

    async signIn({
      email,
      password,
    }: {
      email: string
      password: string
    }): Promise<AuthSession & { session: { secret: string; expire: string } }> {
      return createSessionForCredentials({ email, password })
    },

    async forgotPassword({
      email,
      origin,
    }: {
      email: string
      origin: string
    }): Promise<AuthMessageResponse> {
      const normalizedEmail = normalizeEmail(email)
      const recoveryUrl = assertRecoveryOrigin(origin)
      const user = await ensureAuthUserByEmail(normalizedEmail)

      if (user) {
        try {
          const account = createAuthAccount()
          await account.createRecovery({
            email: normalizedEmail,
            url: recoveryUrl,
          })
        } catch (error) {
          if (isAppwriteErrorWithCode(error, 404)) {
            return {
              message: 'If an account exists for that email, reset instructions have been sent.',
            }
          }

          throw error
        }
      }

      return {
        message: 'If an account exists for that email, reset instructions have been sent.',
      }
    },

    async resetPassword({
      userId,
      secret,
      password,
    }: {
      userId: string
      secret: string
      password: string
    }): Promise<AuthMessageResponse> {
      try {
        const account = createAuthAccount()
        await account.updateRecovery({
          userId,
          secret,
          password,
        })
      } catch (error) {
        if (isAppwriteErrorWithCode(error, 401) || isAppwriteErrorWithCode(error, 404)) {
          throw new AppError(400, 'This password reset link is invalid or has expired.', {
            code: 'INVALID_RECOVERY',
          })
        }

        throw error
      }

      return {
        message: 'Password reset successfully.',
      }
    },

    async getCurrentAccount(sessionSecret: string) {
      const { user } = await getAccountBySessionSecret(sessionSecret)
      const resolvedUser = await ensureAuthUserById(user.$id)

      return toPublicAccount(resolvedUser || user)
    },

    async signOut(sessionSecret: string): Promise<AuthMessageResponse> {
      try {
        const account = createSessionAccount(sessionSecret)
        await account.deleteSession({
          sessionId: 'current',
        })
      } catch (error) {
        if (!isAppwriteErrorWithCode(error, 401) && !isAppwriteErrorWithCode(error, 404)) {
          throw error
        }
      }

      return {
        message: 'Signed out successfully.',
      }
    },

    async getById(accountId: string) {
      const user = await ensureAuthUserById(accountId)

      return user ? toPublicAccount(user) : null
    },
  }
}
