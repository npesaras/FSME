import { createFileRoute } from '@tanstack/react-router'
import HomePage from '../../features/public/pages/HomePage'

export const Route = createFileRoute('/(public)/home')({
  component: HomePage,
})
