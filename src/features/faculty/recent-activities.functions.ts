import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import {
  assertAccountAccess,
  requireCurrentAccountFromRequest,
} from '#/server/features/auth/current-account.server'
import { listRecentActivitiesForFaculty } from '#/server/features/faculty/recent-activities.server'
import type { RecentActivityRecord } from './recent-activities'

const recentActivitiesInputSchema = z.object({
  accountId: z.string().min(1),
})

export const getRecentActivitiesServerFn = createServerFn({ method: 'GET' })
  .inputValidator(recentActivitiesInputSchema)
  .handler(async ({ data }): Promise<RecentActivityRecord[]> => {
    const account = await requireCurrentAccountFromRequest(getRequest())

    assertAccountAccess(
      account.id,
      data.accountId,
      'You are not allowed to view these activities.',
    )

    return listRecentActivitiesForFaculty(account.id)
  })
