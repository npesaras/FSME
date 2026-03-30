import { queryOptions } from '@tanstack/react-query'
import { getRecentActivitiesServerFn } from './recent-activities.functions'
import { recentActivitiesQueryKeys } from './recent-activities'

export function recentActivitiesQueryOptions(accountId: string) {
  return queryOptions({
    queryKey: recentActivitiesQueryKeys.byAccount(accountId),
    queryFn: () => getRecentActivitiesServerFn({ data: { accountId } }),
    staleTime: 60_000,
  })
}
