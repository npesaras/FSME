import { createFileRoute } from '@tanstack/react-router'
import { handleAppwriteTablesRequest } from '#/server/features/auth/routes.server'

export const Route = createFileRoute('/api/v1/appwrite/tables')({
  server: {
    handlers: {
      GET: () => handleAppwriteTablesRequest(),
    },
  },
})
