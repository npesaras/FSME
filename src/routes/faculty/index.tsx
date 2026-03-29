import { createFileRoute } from '@tanstack/react-router'
import FacultyDashboard from '../../features/faculty/pages/FacultyDashboard'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/faculty/')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('faculty')
  },
  component: FacultyDashboard,
})
