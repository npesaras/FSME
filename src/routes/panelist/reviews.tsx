import { createFileRoute } from '@tanstack/react-router'
import PanelistReviewsPage from '../../features/panelist/pages/PanelistReviewsPage'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/panelist/reviews')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('panelist')
  },
  component: PanelistReviewsPage,
})
