import { createFileRoute } from '@tanstack/react-router'
import PanelistDashboard, {
  panelistDashboardViews,
  type PanelistDashboardView,
} from '../../features/panelist/pages/PanelistDashboard'
import { documentTrackingQueryOptions } from '../../features/panelist/document-tracking.queries'
import { recentActivitiesQueryOptions } from '../../features/panelist/recent-activities.queries'

export const Route = createFileRoute('/panelist/')({
  validateSearch: (search): { view: PanelistDashboardView } => ({
    view: panelistDashboardViews.includes(search.view as PanelistDashboardView)
      ? (search.view as PanelistDashboardView)
      : 'dashboard',
  }),
  loaderDeps: ({ search }) => ({
    view: search.view,
  }),
  loader: async ({ context, deps }) => {
    if (deps.view !== 'dashboard') {
      return
    }

    await Promise.all([
      context.queryClient.ensureQueryData(
        documentTrackingQueryOptions(context.account.id),
      ),
      context.queryClient.ensureQueryData(
        recentActivitiesQueryOptions(context.account.id),
      ),
    ])
  },
  component: PanelistDashboardRoute,
})

function PanelistDashboardRoute() {
  const { account } = Route.useRouteContext()
  const { view } = Route.useSearch()

  return <PanelistDashboard account={account} currentView={view} />
}
