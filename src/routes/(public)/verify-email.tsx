import { createFileRoute } from '@tanstack/react-router'
import EmailVerificationPage from '../../features/auth/pages/EmailVerification'
import { redirectAuthenticatedToRoleDashboard } from '../../features/auth/session'

export const Route = createFileRoute('/(public)/verify-email')({
  validateSearch: (search) => ({
    email: typeof search.email === 'string' ? search.email : '',
    userId: typeof search.userId === 'string' ? search.userId : '',
    secret: typeof search.secret === 'string' ? search.secret : '',
  }),
  beforeLoad: async ({ search }) => {
    if (!search.userId || !search.secret) {
      await redirectAuthenticatedToRoleDashboard()
    }
  },
  component: EmailVerificationPage,
})
