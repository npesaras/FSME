import { createFileRoute } from '@tanstack/react-router'
import FacultyDocumentsPage from '../../features/faculty/pages/FacultyDocumentsPage'

export const Route = createFileRoute('/faculty/documents')({
  component: FacultyDocumentsPage,
})
