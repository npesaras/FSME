import { createFileRoute } from '@tanstack/react-router'
import { handleForgotPasswordRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/forgot-password')({
  server: {
    handlers: {
      POST: ({ request }) => handleForgotPasswordRequest(request),
    },
  },
})
