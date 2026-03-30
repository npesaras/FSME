import { ID, Query, type Models } from 'node-appwrite'
import type {
  AuthAccount,
  AuthMessageResponse,
  AuthRole,
  AuthSession,
  AuthVerificationPendingResponse,
} from '#/features/auth/types'
import { AppError } from '../../shared/errors.server'
import type { ServerLogger } from '../../types/logger'
import { createUserProfilesRepository } from './user-profiles.server'

const APP_ROLES: AuthRole[] = ['faculty', 'panelist']
const DEFAULT_APP_ROLE: AuthRole = 'faculty'

type AppwriteUser = Models.User<Record<string, unknown>>

type AccountsServiceDependencies = {
  users: {
    list: (options: { queries?: string[] }) => Promise<{ users: AppwriteUser[] }>
    get: (options: { userId: string }) => Promise<AppwriteUser>
    delete: (options: { userId: string }) => Promise<unknown>
  }
  createAdminAccount: () => {
    createEmailPasswordSession: (options: {
      email: string
      password: string
    }) => Promise<{ secret?: string; expire?: string }>
  }
  createAuthAccount: () => {
    create: (options: {
      userId: string
      email: string
      password: string
      name: string
    }) => Promise<AppwriteUser>
    createRecovery: (options: { email: string; url: string }) => Promise<unknown>
    updateEmailVerification: (options: { userId: string; secret: string }) => Promise<unknown>
    updateRecovery: (options: {
      userId: string
      secret: string
      password: string
    }) => Promise<unknown>
  }
  createSessionAccount: (sessionSecret: string) => {
    get: () => Promise<AppwriteUser>
    createEmailVerification: (options: { url: string }) => Promise<unknown>
    deleteSession: (options: { sessionId: string }) => Promise<unknown>
  }
  tablesDB: {
    listRows: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      queries?: string[]
      total?: boolean
    }) => Promise<{ rows: Row[]; total: number }>
    createRow: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      rowId: string
      data: Record<string, unknown>
      permissions?: string[]
    }) => Promise<Row>
    updateRow: <Row extends Models.Row = Models.DefaultRow>(options: {
      databaseId: string
      tableId: string
      rowId: string
      data: Record<string, unknown>
      permissions?: string[]
    }) => Promise<Row>
    deleteRow: (options: {
      databaseId: string
      tableId: string
      rowId: string
    }) => Promise<unknown>
  }
  databaseId: string
  userProfilesTableId: string
  recoveryOrigins: string[]
  verificationOrigins: string[]
  logger?: ServerLogger
}

function normalizeEmail(email: string) {
  return String(email).trim().toLowerCase()
}

function normalizeName(name: string) {
  return String(name).trim().replace(/\s+/g, ' ')
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

function getAppwriteErrorType(error: unknown) {
  return typeof error === 'object' && error !== null && 'type' in error
    ? error.type
    : undefined
}

function isAppwriteRateLimitError(error: unknown) {
  return isAppwriteErrorWithCode(error, 429) || getAppwriteErrorType(error) === 'general_rate_limit_exceeded'
}

function isInvalidCredentialsError(error: unknown) {
  return (
    isAppwriteErrorWithCode(error, 401) ||
    isAppwriteErrorWithCode(error, 404) ||
    getAppwriteErrorType(error) === 'user_invalid_credentials'
  )
}

function isBlockedUserError(error: unknown) {
  return getAppwriteErrorType(error) === 'user_blocked'
}

function toVerificationSendError(error: unknown) {
  if (error instanceof AppError) {
    return error
  }

  if (isAppwriteRateLimitError(error)) {
    return new AppError(429, 'Please wait a moment before trying again.', {
      code: 'RATE_LIMITED',
    })
  }

  return new AppError(500, 'We could not send a verification email right now. Please try again.', {
    code: 'VERIFICATION_SEND_FAILED',
  })
}

function normalizeRole(role: unknown): AuthRole | null {
  if (typeof role !== 'string') {
    return null
  }

  const normalizedRole = role.trim().toLowerCase()

  return APP_ROLES.includes(normalizedRole as AuthRole) ? (normalizedRole as AuthRole) : null
}

function toPublicAccount(user: AppwriteUser, role: AuthRole): AuthAccount {
  return {
    id: user.$id,
    name: user.name,
    email: user.email,
    role,
    status: user.status ? 'active' : 'disabled',
    lastSignInAt: user.accessedAt || null,
    emailVerified: user.emailVerification,
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
  userProfilesTableId,
  recoveryOrigins,
  verificationOrigins,
  logger,
}: AccountsServiceDependencies) {
  const userProfiles = createUserProfilesRepository({
    tablesDB,
    databaseId,
    tableId: userProfilesTableId,
    logger,
  })
  const allowedRecoveryOrigins = new Set(
    recoveryOrigins.flatMap((origin) => {
      const normalizedOrigin = normalizeOrigin(origin)

      return normalizedOrigin ? [normalizedOrigin] : []
    })
  )
  const allowedVerificationOrigins = new Set(
    verificationOrigins.flatMap((origin) => {
      const normalizedOrigin = normalizeOrigin(origin)

      return normalizedOrigin ? [normalizedOrigin] : []
    })
  )

  function assertAllowedOrigin({
    origin,
    allowedOrigins,
    code,
    message,
    pathname,
  }: {
    origin: string
    allowedOrigins: Set<string>
    code: string
    message: string
    pathname: string
  }) {
    const normalizedOrigin = normalizeOrigin(origin)

    if (!normalizedOrigin || !allowedOrigins.has(normalizedOrigin)) {
      throw new AppError(400, message, {
        code,
      })
    }

    return `${normalizedOrigin}${pathname}`
  }

  function assertRecoveryOrigin(origin: string) {
    return assertAllowedOrigin({
      origin,
      allowedOrigins: allowedRecoveryOrigins,
      code: 'INVALID_RECOVERY_ORIGIN',
      message: 'Password recovery is not available from this origin.',
      pathname: '/reset-password',
    })
  }

  function assertVerificationOrigin(origin: string) {
    return assertAllowedOrigin({
      origin,
      allowedOrigins: allowedVerificationOrigins,
      code: 'INVALID_VERIFICATION_ORIGIN',
      message: 'Email verification is not available from this origin.',
      pathname: '/verify-email',
    })
  }

  function createRoleAssignmentError() {
    return new AppError(
      403,
      'Your account does not have an assigned application role. Please contact support.',
      {
        code: 'ACCOUNT_ROLE_MISSING',
      },
    )
  }

  async function getProfileRoleOrNull(userId: string): Promise<AuthRole | null> {
    const profile = await userProfiles.findByUserId(userId)
    const profileRole = normalizeRole(profile?.role)

    if (profileRole) {
      return profileRole
    }

    return null
  }

  async function getRequiredProfileRole(userId: string): Promise<AuthRole> {
    const profileRole = await getProfileRoleOrNull(userId)

    if (profileRole) {
      return profileRole
    }

    throw createRoleAssignmentError()
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

  async function deleteCurrentSession(account: ReturnType<typeof createSessionAccount>) {
    try {
      await account.deleteSession({
        sessionId: 'current',
      })
    } catch (error) {
      if (!isAppwriteErrorWithCode(error, 401) && !isAppwriteErrorWithCode(error, 404)) {
        throw error
      }
    }
  }

  async function createSessionForCredentials({
    email,
    password,
    origin,
  }: {
    email: string
    password: string
    origin: string
    }) {
    const normalizedEmail = normalizeEmail(email)
    let session

    try {
      const account = createAdminAccount()
      session = await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      })
    } catch (error) {
      if (isInvalidCredentialsError(error)) {
        throw new AppError(401, 'Invalid email or password.', {
          code: 'INVALID_CREDENTIALS',
        })
      }

      if (isBlockedUserError(error)) {
        throw new AppError(403, 'Your account has been temporarily suspended. Please contact support.', {
          code: 'ACCOUNT_BLOCKED',
        })
      }

      if (isAppwriteRateLimitError(error)) {
        throw new AppError(429, 'Please wait a moment before trying again.', {
          code: 'RATE_LIMITED',
        })
      }

      throw error
    }

    if (!session?.secret || !session?.expire) {
      throw new AppError(500, 'We could not finish creating your sign-in session. Please try again.', {
        code: 'SESSION_CREATION_FAILED',
      })
    }

    const sessionAccount = createSessionAccount(session.secret)
    const user = await sessionAccount.get()

    if (!user.emailVerification) {
      let verificationError: unknown = null

      try {
        await sessionAccount.createEmailVerification({
          url: assertVerificationOrigin(origin),
        })
      } catch (error) {
        verificationError = error
      } finally {
        await deleteCurrentSession(sessionAccount)
      }

      if (verificationError && !isAppwriteRateLimitError(verificationError)) {
        throw toVerificationSendError(verificationError)
      }

      throw new AppError(
        403,
        'Your account is not yet verified.',
        {
          code: 'EMAIL_NOT_VERIFIED',
        }
      )
    }

    let role: AuthRole

    try {
      role = await getRequiredProfileRole(user.$id)
    } catch (error) {
      await deleteCurrentSession(sessionAccount)
      throw error
    }

    await userProfiles.upsertVerifiedProfile({
      userId: user.$id,
      fullName: normalizeName(user.name),
      role,
    })

    return {
      account: toPublicAccount(user, role),
      session: {
        secret: session.secret,
        expire: session.expire,
      },
      sessionAccount,
      user,
    }
  }

  async function deleteMirroredProfile(userId: string) {
    try {
      await userProfiles.deleteByUserId(userId)
    } catch (error) {
      if (error instanceof AppError && error.code === 'USER_PROFILES_TABLE_MISSING') {
        logger?.warn?.(
          {
            tableId: userProfilesTableId,
            userId,
          },
          'User profiles table missing during account deletion. Continuing with Appwrite user deletion.'
        )
        return
      }

      throw error
    }
  }

  return {
    async signUp({
      name,
      email,
      password,
      origin,
    }: {
      name: string
      email: string
      password: string
      origin: string
    }): Promise<AuthVerificationPendingResponse> {
      const normalizedEmail = normalizeEmail(email)
      const normalizedName = normalizeName(name)
      const existingUser = await findAuthUserByEmail(normalizedEmail)

      if (existingUser) {
        throw new AppError(409, 'An account with that email already exists.', {
          code: 'EMAIL_TAKEN',
        })
      }

      try {
        const account = createAuthAccount()
        const createdUser = await account.create({
          userId: ID.unique(),
          email: normalizedEmail,
          password,
          name: normalizedName,
        })
        await userProfiles.upsertVerifiedProfile({
          userId: createdUser.$id,
          fullName: normalizedName,
          role: DEFAULT_APP_ROLE,
        })
        const session = await createAdminAccount().createEmailPasswordSession({
          email: normalizedEmail,
          password,
        })

        if (!session?.secret) {
          throw new AppError(500, 'We could not prepare email verification. Please try again.', {
            code: 'SESSION_CREATION_FAILED',
          })
        }

        const sessionAccount = createSessionAccount(session.secret)

        try {
          await sessionAccount.createEmailVerification({
            url: assertVerificationOrigin(origin),
          })
        } catch (error) {
          throw toVerificationSendError(error)
        } finally {
          await deleteCurrentSession(sessionAccount)
        }

        return {
          email: normalizedEmail,
          message: `We sent a verification email to ${createdUser.email}. Verify your account before signing in.`,
          verificationRequired: true,
        }
      } catch (error) {
        if (isAppwriteErrorWithCode(error, 409)) {
          throw new AppError(409, 'An account with that email already exists.', {
            code: 'EMAIL_TAKEN',
          })
        }

        if (isAppwriteRateLimitError(error)) {
          throw new AppError(429, 'Please wait a moment before trying again.', {
            code: 'RATE_LIMITED',
          })
        }

        throw error
      }
    },

    async signIn({
      email,
      password,
      origin,
    }: {
      email: string
      password: string
      origin: string
    }): Promise<AuthSession & { session: { secret: string; expire: string } }> {
      const { account, session } = await createSessionForCredentials({ email, password, origin })

      return {
        account,
        session,
      }
    },

    async completeEmailVerification({
      userId,
      secret,
    }: {
      userId: string
      secret: string
    }): Promise<AuthMessageResponse> {
      try {
        const account = createAuthAccount()
        await account.updateEmailVerification({
          userId,
          secret,
        })
      } catch (error) {
        if (isInvalidCredentialsError(error)) {
          throw new AppError(400, 'This email verification link is invalid or has expired.', {
            code: 'INVALID_VERIFICATION',
          })
        }

        if (isAppwriteRateLimitError(error)) {
          throw new AppError(429, 'Please wait a moment before trying again.', {
            code: 'RATE_LIMITED',
          })
        }

        throw error
      }

      const verifiedUser = (await users.get({
        userId,
      })) as AppwriteUser
      const role = await getRequiredProfileRole(verifiedUser.$id)

      await userProfiles.upsertVerifiedProfile({
        userId: verifiedUser.$id,
        fullName: normalizeName(verifiedUser.name),
        role,
      })

      return {
        message: 'Email verified successfully. You can now sign in.',
      }
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
      const user = await findAuthUserByEmail(normalizedEmail)

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

          if (isAppwriteRateLimitError(error)) {
            throw new AppError(429, 'Please wait a moment before trying again.', {
              code: 'RATE_LIMITED',
            })
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

        if (isAppwriteRateLimitError(error)) {
          throw new AppError(429, 'Please wait a moment before trying again.', {
            code: 'RATE_LIMITED',
          })
        }

        throw error
      }

      return {
        message: 'Password reset successfully.',
      }
    },

    async getCurrentAccount(sessionSecret: string) {
      const { account, user } = await getAccountBySessionSecret(sessionSecret)

      if (!user.emailVerification) {
        await deleteCurrentSession(account)

        throw new AppError(401, 'Authentication required.', {
          code: 'UNAUTHORIZED',
        })
      }

      let role: AuthRole

      try {
        role = await getRequiredProfileRole(user.$id)
      } catch (error) {
        await deleteCurrentSession(account)

        if (error instanceof AppError && error.code === 'ACCOUNT_ROLE_MISSING') {
          throw new AppError(401, 'Authentication required.', {
            code: 'UNAUTHORIZED',
          })
        }

        throw error
      }

      await userProfiles.upsertVerifiedProfile({
        userId: user.$id,
        fullName: normalizeName(user.name),
        role,
      })

      return toPublicAccount(user, role)
    },

    async signOut(sessionSecret: string): Promise<AuthMessageResponse> {
      await deleteCurrentSession(createSessionAccount(sessionSecret))

      return {
        message: 'Signed out successfully.',
      }
    },

    async deleteCurrentAccount(sessionSecret: string): Promise<AuthMessageResponse> {
      const { user } = await getAccountBySessionSecret(sessionSecret)

      await deleteMirroredProfile(user.$id)

      try {
        await users.delete({
          userId: user.$id,
        })
      } catch (error) {
        if (isAppwriteErrorWithCode(error, 404)) {
          return {
            message: 'Your account has been deleted successfully.',
          }
        }

        if (isAppwriteRateLimitError(error)) {
          throw new AppError(429, 'Please wait a moment before trying again.', {
            code: 'RATE_LIMITED',
          })
        }

        throw error
      }

      return {
        message: 'Your account has been deleted successfully.',
      }
    },

    async getById(accountId: string) {
      const user = await getAuthUserById(accountId)

      if (!user) {
        return null
      }

      const role = await getProfileRoleOrNull(user.$id)

      if (!role) {
        return null
      }

      return toPublicAccount(user, role)
    },
  }
}
