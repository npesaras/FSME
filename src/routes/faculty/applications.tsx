import { createFileRoute } from '@tanstack/react-router'
import FacultyApplicationsPage from '../../features/faculty/pages/FacultyApplicationsPage'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/faculty/applications')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('faculty')
  },
  component: FacultyApplicationsPage,
})
