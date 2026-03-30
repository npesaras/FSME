import { useSuspenseQuery } from '@tanstack/react-query'
import { recentActivitiesQueryOptions } from '@/features/faculty/recent-activities.queries'

interface RecentActivitiesProps {
  accountId: string
}

export const RecentActivities = ({ accountId }: RecentActivitiesProps) => {
  const { data } = useSuspenseQuery(recentActivitiesQueryOptions(accountId))

  return (
    <div className="faculty-panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Recent Activities</h2>
      </div>

      <div className="space-y-3">
        {data.length ? (
          data.map((activity) => (
            <div
              key={activity.id}
              className="faculty-panel-subtle rounded-md p-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {activity.title}
                  </h3>
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="pt-0.5 text-[10px] font-medium text-muted-foreground/80">
                    {activity.timeLabel}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="faculty-panel-subtle rounded-md p-4">
            <p className="text-sm font-semibold text-foreground">No recent activities yet</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              New submissions, review remarks, and document updates will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
