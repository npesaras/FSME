import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import {
  assertAccountAccess,
  requireCurrentAccountFromRequest,
} from '#/server/features/auth/current-account.server'
import { listDocumentTrackingRecordsForFaculty } from '#/server/features/faculty/document-tracking.server'
import type { DocumentTrackingRecord } from './document-tracking'

const documentTrackingInputSchema = z.object({
  accountId: z.string().min(1),
})

export const getDocumentTrackingServerFn = createServerFn({ method: 'GET' })
  .inputValidator(documentTrackingInputSchema)
  .handler(async ({ data }): Promise<DocumentTrackingRecord[]> => {
    const account = await requireCurrentAccountFromRequest(getRequest())

    assertAccountAccess(
      account.id,
      data.accountId,
      'You are not allowed to view these records.',
    )

    return listDocumentTrackingRecordsForFaculty(account.id)
  })
