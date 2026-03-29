import { createFileRoute } from '@tanstack/react-router'
import { handleAppwriteHealthRequest } from '#/server/auth/routes.server'

export const Route = createFileRoute('/api/v1/appwrite/health')({
  server: {
    handlers: {
      GET: () => handleAppwriteHealthRequest(),
    },
  },
})
