import { createFileRoute } from '@tanstack/react-router'
import PanelistDecisionsPage from '../../features/panelist/pages/PanelistDecisionsPage'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/panelist/decisions')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('panelist')
  },
  component: PanelistDecisionsPage,
})
