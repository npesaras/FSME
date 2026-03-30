import { createFileRoute } from '@tanstack/react-router'
import PanelistApplicationsPage from '../../features/panelist/pages/PanelistApplicationsPage'

export const Route = createFileRoute('/panelist/applications')({
  component: PanelistApplicationsPage,
})
