import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordSuccessPage from '../../features/auth/pages/ResetPasswordSuccess'

export const Route = createFileRoute('/(public)/reset-success')({
  component: ResetPasswordSuccessPage,
})
