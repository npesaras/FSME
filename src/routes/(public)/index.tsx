import { createFileRoute } from '@tanstack/react-router'
import LoginPage from '../../features/auth/pages/LoginPage'
import { redirectAuthenticatedToRoleDashboard } from '../../features/auth/session'

export const Route = createFileRoute('/(public)/')({
  beforeLoad: async () => {
    await redirectAuthenticatedToRoleDashboard()
  },
  component: LoginPage,
})
