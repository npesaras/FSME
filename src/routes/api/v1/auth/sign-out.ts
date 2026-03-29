import { createFileRoute } from '@tanstack/react-router'
import { handleSignOutRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/sign-out')({
  server: {
    handlers: {
      POST: ({ request }) => handleSignOutRequest(request),
    },
  },
})
