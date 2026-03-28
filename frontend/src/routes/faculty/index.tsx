import { createFileRoute } from '@tanstack/react-router'
import FacultyOverviewPage from '../../features/faculty/pages/FacultyOverviewPage'

export const Route = createFileRoute('/faculty/')({
  component: FacultyOverviewPage,
})
