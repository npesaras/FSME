import { useSuspenseQuery } from '@tanstack/react-query'
import { ScopeRecentActivities } from '@/features/shared/workspace/components/ScopeRecentActivities'
import { recentActivitiesQueryOptions } from '@/features/panelist/recent-activities.queries'

interface PanelistRecentActivitiesProps {
  accountId: string
}

export const PanelistRecentActivities = ({
  accountId,
}: PanelistRecentActivitiesProps) => {
  const { data } = useSuspenseQuery(recentActivitiesQueryOptions(accountId))

  return <ScopeRecentActivities data={data} />
}
