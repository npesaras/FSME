import { createFileRoute } from '@tanstack/react-router'
import { handleEmailStatusRequest } from '#/server/features/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/email-status')({
  server: {
    handlers: {
      POST: ({ request }) => handleEmailStatusRequest(request),
    },
  },
})
