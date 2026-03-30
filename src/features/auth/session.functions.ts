import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getCurrentAccountFromRequestOrNull } from '#/server/features/auth/current-account.server'
import type { AuthAccount } from './types'

export const getCurrentAccountServerFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthAccount | null> => {
    return getCurrentAccountFromRequestOrNull(getRequest())
  }
)
