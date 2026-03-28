import { createFileRoute } from '@tanstack/react-router'
import FacultyApplicationsPage from '../../features/faculty/pages/FacultyApplicationsPage'

export const Route = createFileRoute('/faculty/applications')({
  component: FacultyApplicationsPage,
})
