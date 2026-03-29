import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getSessionSecretFromRequest } from '#/server/auth/cookies.server'
import { AppError } from '#/server/auth/errors.server'
import { authRuntime } from '#/server/auth/runtime.server'
import type { AuthAccount } from './types'

export const getCurrentAccountServerFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthAccount | null> => {
    const request = getRequest()
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
)
