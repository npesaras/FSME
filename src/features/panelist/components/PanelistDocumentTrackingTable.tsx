import { useSuspenseQuery } from '@tanstack/react-query'

import { ScopeDocumentTrackingTable } from '@/features/shared/workspace/components/ScopeDocumentTrackingTable'
import { documentTrackingQueryOptions } from '@/features/panelist/document-tracking.queries'

interface PanelistDocumentTrackingTableProps {
  accountId: string
}

export function PanelistDocumentTrackingTable({
  accountId,
}: PanelistDocumentTrackingTableProps) {
  const { data } = useSuspenseQuery(documentTrackingQueryOptions(accountId))

  return <ScopeDocumentTrackingTable data={data} />
}
