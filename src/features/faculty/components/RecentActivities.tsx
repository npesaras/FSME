import { useSuspenseQuery } from '@tanstack/react-query'
import { ScopeRecentActivities } from '@/features/shared/workspace/components/ScopeRecentActivities'
import { recentActivitiesQueryOptions } from '@/features/faculty/recent-activities.queries'

interface RecentActivitiesProps {
  accountId: string
}

export const RecentActivities = ({ accountId }: RecentActivitiesProps) => {
  const { data } = useSuspenseQuery(recentActivitiesQueryOptions(accountId))

  return <ScopeRecentActivities data={data} />
}
