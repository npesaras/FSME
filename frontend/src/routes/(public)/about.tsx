import { createFileRoute } from '@tanstack/react-router'
import AboutPage from '../../features/public/pages/AboutPage'

export const Route = createFileRoute('/(public)/about')({
  component: AboutPage,
})
