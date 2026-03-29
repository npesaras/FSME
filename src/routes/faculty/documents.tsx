import { createFileRoute } from '@tanstack/react-router'
import FacultyDocumentsPage from '../../features/faculty/pages/FacultyDocumentsPage'
import { requireAuthenticatedRole } from '../../features/auth/session'

export const Route = createFileRoute('/faculty/documents')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('faculty')
  },
  component: FacultyDocumentsPage,
})
