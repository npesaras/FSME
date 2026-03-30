import { createFileRoute } from '@tanstack/react-router'
import { handleVerifyEmailRequest } from '#/server/features/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/verify-email')({
  server: {
    handlers: {
      POST: ({ request }) => handleVerifyEmailRequest(request),
    },
  },
})
