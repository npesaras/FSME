import { createFileRoute } from '@tanstack/react-router'
import { handleHealthRequest } from '#/server/features/auth/routes.server'

export const Route = createFileRoute('/api/v1/health')({
  server: {
    handlers: {
      GET: () => handleHealthRequest(),
    },
  },
})
