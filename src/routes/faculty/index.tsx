import { createFileRoute } from '@tanstack/react-router'
import FacultyDashboard from '../../features/faculty/pages/FacultyDashboard'
import { documentTrackingQueryOptions } from '../../features/faculty/document-tracking.queries'
import { recentActivitiesQueryOptions } from '../../features/faculty/recent-activities.queries'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/faculty/')({
  beforeLoad: async () => ({
    account: await requireAuthenticatedRole('faculty'),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(documentTrackingQueryOptions(context.account.id)),
      context.queryClient.ensureQueryData(recentActivitiesQueryOptions(context.account.id)),
    ]),
  component: FacultyDashboardRoute,
})

function FacultyDashboardRoute() {
  const { account } = Route.useRouteContext()

  return <FacultyDashboard accountId={account.id} />
}
