import { createFileRoute } from '@tanstack/react-router'
import PanelistReviewsPage from '../../features/panelist/pages/PanelistReviewsPage'

export const Route = createFileRoute('/panelist/reviews')({
  component: PanelistReviewsPage,
})
