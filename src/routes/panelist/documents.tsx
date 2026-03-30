import { createFileRoute } from '@tanstack/react-router'
import PanelistDocumentsPage from '../../features/panelist/pages/PanelistDocumentsPage'
import { documentTrackingQueryOptions } from '../../features/panelist/document-tracking.queries'

export const Route = createFileRoute('/panelist/documents')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      documentTrackingQueryOptions(context.account.id),
    )
  },
  component: PanelistDocumentsRoute,
})

function PanelistDocumentsRoute() {
  const { account } = Route.useRouteContext()

  return <PanelistDocumentsPage accountId={account.id} />
}
