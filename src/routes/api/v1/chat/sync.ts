import { createFileRoute } from '@tanstack/react-router'
import { handleCometChatSyncRequest } from '#/server/features/chat/routes.server'

export const Route = createFileRoute('/api/v1/chat/sync')({
  server: {
    handlers: {
      GET: ({ request }) => handleCometChatSyncRequest(request),
      POST: ({ request }) => handleCometChatSyncRequest(request),
    },
  },
})
