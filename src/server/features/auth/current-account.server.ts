import { AppError } from '#/server/shared/errors.server'
import type { AuthAccount } from '#/features/auth/types'
import { getSessionSecretFromRequest } from './cookies.server'
import { authRuntime } from './runtime.server'

export async function getCurrentAccountFromRequestOrNull(
  request: Request,
): Promise<AuthAccount | null> {
  const sessionSecret = getSessionSecretFromRequest(request)

  if (!sessionSecret) {
    return null
  }

  try {
    return await authRuntime.accounts.getCurrentAccount(sessionSecret)
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      return null
    }

    throw error
  }
}

export async function requireCurrentAccountFromRequest(
  request: Request,
): Promise<AuthAccount> {
  const sessionSecret = getSessionSecretFromRequest(request)

  if (!sessionSecret) {
    throw new AppError(401, 'Authentication required.', {
      code: 'UNAUTHORIZED',
    })
  }

  return authRuntime.accounts.getCurrentAccount(sessionSecret)
}

export function assertAccountAccess(
  currentAccountId: string,
  requestedAccountId: string,
  message: string,
) {
  if (currentAccountId !== requestedAccountId) {
    throw new AppError(403, message, {
      code: 'FORBIDDEN',
    })
  }
}
