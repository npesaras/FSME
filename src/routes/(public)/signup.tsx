import { createFileRoute } from '@tanstack/react-router'
import SignupPage from '../../features/auth/pages/SignupPage'
import { redirectAuthenticatedToRoleDashboard } from '../../features/auth/session'

export const Route = createFileRoute('/(public)/signup')({
  beforeLoad: async () => {
    await redirectAuthenticatedToRoleDashboard()
  },
  component: SignupPage,
})
