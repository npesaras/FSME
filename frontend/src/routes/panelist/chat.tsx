import { createFileRoute } from '@tanstack/react-router'
import { panelistScopeLinks } from '../../features/panelist/config'
import SharedChatWorkspacePage from '../../features/shared/chat/pages/SharedChatWorkspacePage'

function PanelistChatPage() {
  return (
    <SharedChatWorkspacePage
      actor="panelist"
      kicker="Panelist shared chat"
      title="Keep deliberation follow-ups and reviewer coordination in one place."
      description="Use the shared CometChat workspace to follow up on cases, coordinate review details, and keep panel conversations close to the rest of the panelist workflow."
      links={panelistScopeLinks.filter((link) => link.to !== '/panelist/chat')}
    />
  )
}

export const Route = createFileRoute('/panelist/chat')({
  component: PanelistChatPage,
})
