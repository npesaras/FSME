interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: '1',
    title: 'Paper Rejected',
    description: 'Your recent submission "A Study on AI in Education" has been rejected with remarks from the review committee.',
    time: '2 hours ago'
  },
  {
    id: '2',
    title: 'Document Update Required',
    description: 'Author Dr. Smith has left remarks and requested revisions for the "Research Grant Proposal Draft".',
    time: 'Today, 3:15PM'
  }
];

export const RecentActivities = () => {
  return (
    <div className="faculty-panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Recent Activities</h2>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="faculty-panel-subtle rounded-md p-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {activity.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {activity.description}
                </p>
                <p className="pt-0.5 text-[10px] font-medium text-muted-foreground/80">
                  {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border/60 pt-3 text-center">
        <button className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">
          See All Activities
        </button>
      </div>
    </div>
  );
};
