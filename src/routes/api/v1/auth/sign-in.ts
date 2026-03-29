import { createFileRoute } from '@tanstack/react-router'
import { handleSignInRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/sign-in')({
  server: {
    handlers: {
      POST: ({ request }) => handleSignInRequest(request),
    },
  },
})
