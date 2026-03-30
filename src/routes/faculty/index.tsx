import { createFileRoute } from '@tanstack/react-router'
import FacultyDashboard from '../../features/faculty/pages/FacultyDashboard'
import { documentTrackingQueryOptions } from '../../features/faculty/document-tracking.queries'
import { recentActivitiesQueryOptions } from '../../features/faculty/recent-activities.queries'

export const Route = createFileRoute('/faculty/')({
  validateSearch: (search) => ({
    view:
      search.view === 'application' || search.view === 'account-setting'
        ? search.view
        : 'dashboard',
  }),
  loaderDeps: ({ search }) => ({
    view: search.view,
  }),
  loader: ({ context, deps }) =>
    deps.view === 'dashboard'
      ? Promise.all([
          context.queryClient.ensureQueryData(documentTrackingQueryOptions(context.account.id)),
          context.queryClient.ensureQueryData(recentActivitiesQueryOptions(context.account.id)),
        ])
      : undefined,
  component: FacultyDashboardRoute,
})

function FacultyDashboardRoute() {
  const { account } = Route.useRouteContext()
  const { view } = Route.useSearch()

  return <FacultyDashboard account={account} currentView={view} />
}
