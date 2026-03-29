import { createFileRoute } from '@tanstack/react-router'
import { handleSignUpRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/sign-up')({
  server: {
    handlers: {
      POST: ({ request }) => handleSignUpRequest(request),
    },
  },
})
