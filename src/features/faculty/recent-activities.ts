export interface RecentActivityRecord {
  id: string
  title: string
  description: string
  timeLabel: string
  occurredAt: string
  activityType: string
}

export const recentActivitiesQueryKeys = {
  all: ['faculty', 'recent-activities'] as const,
  byAccount: (accountId: string) =>
    [...recentActivitiesQueryKeys.all, accountId] as const,
}
