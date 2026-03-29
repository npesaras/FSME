import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getSessionSecretFromRequest } from '#/server/features/auth/cookies.server'
import { authRuntime } from '#/server/features/auth/runtime.server'
import { listRecentActivitiesForFaculty } from '#/server/features/faculty/recent-activities.server'
import { AppError } from '#/server/shared/errors.server'
import type { RecentActivityRecord } from './recent-activities'

const recentActivitiesInputSchema = z.object({
  accountId: z.string().min(1),
})

export const getRecentActivitiesServerFn = createServerFn({ method: 'GET' })
  .inputValidator(recentActivitiesInputSchema)
  .handler(async ({ data }): Promise<RecentActivityRecord[]> => {
    const request = getRequest()
    const sessionSecret = getSessionSecretFromRequest(request)

    if (!sessionSecret) {
      throw new AppError(401, 'Authentication required.', {
        code: 'UNAUTHORIZED',
      })
    }

    const account = await authRuntime.accounts.getCurrentAccount(sessionSecret)

    if (account.id !== data.accountId) {
      throw new AppError(403, 'You are not allowed to view these activities.', {
        code: 'FORBIDDEN',
      })
    }

    return listRecentActivitiesForFaculty(account.id)
  })
