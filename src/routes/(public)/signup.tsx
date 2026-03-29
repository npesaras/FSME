import { createFileRoute } from '@tanstack/react-router'
import SignupPage from '../../features/auth/pages/SignupPage'

export const Route = createFileRoute('/(public)/signup')({
  component: SignupPage,
})
