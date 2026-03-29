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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Recent Activities</h2>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 border border-slate-200 rounded-md bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-slate-800">
                  {activity.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {activity.description}
                </p>
                <p className="text-[10px] text-slate-400 pt-0.5 font-medium">
                  {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-center">
        <button className="text-xs font-semibold text-slate-600 transition-colors hover:text-primary">
          See All Activities
        </button>
      </div>
    </div>
  );
};
