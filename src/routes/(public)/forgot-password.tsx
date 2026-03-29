import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPassword'

export const Route = createFileRoute('/(public)/forgot-password')({
  component: ForgotPasswordPage,
})
