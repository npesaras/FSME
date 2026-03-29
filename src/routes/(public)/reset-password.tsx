import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPage from '../../features/auth/pages/ResetPassword'

export const Route = createFileRoute('/(public)/reset-password')({
  validateSearch: (search) => ({
    userId: typeof search.userId === 'string' ? search.userId : '',
    secret: typeof search.secret === 'string' ? search.secret : '',
  }),
  component: ResetPasswordPage,
})
