import { useSuspenseQuery } from '@tanstack/react-query'

import { ScopeDocumentTrackingTable } from '@/features/shared/workspace/components/ScopeDocumentTrackingTable'
import { documentTrackingQueryOptions } from '@/features/faculty/document-tracking.queries'

interface DocumentTrackingTableProps {
  accountId: string
}

export function DocumentTrackingTable({ accountId }: DocumentTrackingTableProps) {
  const { data } = useSuspenseQuery(documentTrackingQueryOptions(accountId))

  return <ScopeDocumentTrackingTable data={data} />
}
