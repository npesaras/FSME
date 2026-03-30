import { createFileRoute } from '@tanstack/react-router'
import PanelistOverviewPage from '../../features/panelist/pages/PanelistOverviewPage'

export const Route = createFileRoute('/panelist/')({
  component: PanelistOverviewPage,
})
