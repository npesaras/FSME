import { createFileRoute } from '@tanstack/react-router'
import PanelistOverviewPage from '../../features/panelist/pages/PanelistOverviewPage'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/panelist/')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('panelist')
  },
  component: PanelistOverviewPage,
})
