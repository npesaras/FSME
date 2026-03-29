import { queryOptions } from '@tanstack/react-query'
import { getDocumentTrackingServerFn } from './document-tracking.functions'
import { documentTrackingQueryKeys } from './document-tracking'

export function documentTrackingQueryOptions(accountId: string) {
  return queryOptions({
    queryKey: documentTrackingQueryKeys.byAccount(accountId),
    queryFn: () => getDocumentTrackingServerFn({ data: { accountId } }),
    staleTime: 60_000,
  })
}
