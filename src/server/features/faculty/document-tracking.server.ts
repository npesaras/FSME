import type { DocumentTrackingRecord } from '#/features/faculty/document-tracking'
import { listDocumentTrackingRecordsForAccount } from '../shared/document-tracking.server'

export async function listDocumentTrackingRecordsForFaculty(accountId: string) {
  return listDocumentTrackingRecordsForAccount(accountId) as Promise<DocumentTrackingRecord[]>
}
