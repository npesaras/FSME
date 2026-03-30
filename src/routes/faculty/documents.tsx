import { createFileRoute } from '@tanstack/react-router'
import FacultyDocumentsPage from '../../features/faculty/pages/FacultyDocumentsPage'
import { documentTrackingQueryOptions } from '../../features/faculty/document-tracking.queries'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/faculty/documents')({
  beforeLoad: async () => ({
    account: await requireAuthenticatedRole('faculty'),
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      documentTrackingQueryOptions(context.account.id),
    ),
  component: FacultyDocumentsRoute,
})

function FacultyDocumentsRoute() {
  const { account } = Route.useRouteContext()

  return <FacultyDocumentsPage accountId={account.id} />
}
