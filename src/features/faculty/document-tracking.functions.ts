import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getSessionSecretFromRequest } from '#/server/features/auth/cookies.server'
import { authRuntime } from '#/server/features/auth/runtime.server'
import { listDocumentTrackingRecordsForFaculty } from '#/server/features/faculty/document-tracking.server'
import { AppError } from '#/server/shared/errors.server'
import type { DocumentTrackingRecord } from './document-tracking'

const documentTrackingInputSchema = z.object({
  accountId: z.string().min(1),
})

export const getDocumentTrackingServerFn = createServerFn({ method: 'GET' })
  .inputValidator(documentTrackingInputSchema)
  .handler(async ({ data }): Promise<DocumentTrackingRecord[]> => {
    const request = getRequest()
    const sessionSecret = getSessionSecretFromRequest(request)

    if (!sessionSecret) {
      throw new AppError(401, 'Authentication required.', {
        code: 'UNAUTHORIZED',
      })
    }

    const account = await authRuntime.accounts.getCurrentAccount(sessionSecret)

    if (account.id !== data.accountId) {
      throw new AppError(403, 'You are not allowed to view these records.', {
        code: 'FORBIDDEN',
      })
    }

    return listDocumentTrackingRecordsForFaculty(account.id)
  })
