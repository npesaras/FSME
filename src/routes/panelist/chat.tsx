import { createFileRoute } from '@tanstack/react-router'
import SharedChatWorkspacePage from '../../features/shared/chat/pages/SharedChatWorkspacePage'

function PanelistChatRouteComponent() {
  return (
    <div className="faculty-chat-shell">
      <SharedChatWorkspacePage actor="panelist" bare />
    </div>
  )
}

export const Route = createFileRoute('/panelist/chat')({
  component: PanelistChatRouteComponent,
})
