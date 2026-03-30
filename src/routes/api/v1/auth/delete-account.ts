import { createFileRoute } from '@tanstack/react-router'
import { handleDeleteAccountRequest } from '#/server/features/auth/routes.server'

export const Route = createFileRoute('/api/v1/auth/delete-account')({
  server: {
    handlers: {
      POST: ({ request }) => handleDeleteAccountRequest(request),
    },
  },
})
