export type DocumentTrackingStatus = 'Accepted' | 'Pending' | 'Rejected'

export interface DocumentTrackingRecord {
  id: string
  date: string
  status: DocumentTrackingStatus
  fileName: string
  remarks: string
}

export const documentTrackingQueryKeys = {
  all: ['panelist', 'document-tracking'] as const,
  byAccount: (accountId: string) =>
    [...documentTrackingQueryKeys.all, accountId] as const,
}
