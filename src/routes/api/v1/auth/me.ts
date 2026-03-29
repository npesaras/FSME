import { createFileRoute } from '@tanstack/react-router'
import { handleCurrentAccountRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/me')({
  server: {
    handlers: {
      GET: ({ request }) => handleCurrentAccountRequest(request),
    },
  },
})
