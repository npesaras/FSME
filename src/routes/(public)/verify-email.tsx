import { createFileRoute } from '@tanstack/react-router'
import EmailVerificationPage from '../../features/auth/pages/EmailVerification'
import { redirectAuthenticatedToRoleDashboard } from '../../features/auth/session'

export const Route = createFileRoute('/(public)/verify-email')({
  validateSearch: (search) => ({
    email: typeof search.email === 'string' ? search.email : undefined,
    userId:
      typeof search.userId === 'string' && search.userId.length > 0
        ? search.userId
        : undefined,
    secret:
      typeof search.secret === 'string' && search.secret.length > 0
        ? search.secret
        : undefined,
  }),
  beforeLoad: async ({ search }) => {
    if (!search.userId || !search.secret) {
      await redirectAuthenticatedToRoleDashboard()
    }
  },
  component: EmailVerificationPage,
})
