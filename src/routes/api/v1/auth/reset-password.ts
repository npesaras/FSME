import { createFileRoute } from '@tanstack/react-router'
import { handleResetPasswordRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/reset-password')({
  server: {
    handlers: {
      POST: ({ request }) => handleResetPasswordRequest(request),
    },
  },
})
