import { createFileRoute } from '@tanstack/react-router'
import PanelistDecisionsPage from '../../features/panelist/pages/PanelistDecisionsPage'

export const Route = createFileRoute('/panelist/decisions')({
  component: PanelistDecisionsPage,
})
