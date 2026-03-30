import { createFileRoute } from '@tanstack/react-router'
import SharedChatWorkspacePage from '../../features/shared/chat/pages/SharedChatWorkspacePage'

function FacultyChatRouteComponent() {
  return (
    <div className="faculty-chat-shell">
      <SharedChatWorkspacePage actor="faculty" bare />
    </div>
  )
}

export const Route = createFileRoute('/faculty/chat')({
  component: FacultyChatRouteComponent,
})
