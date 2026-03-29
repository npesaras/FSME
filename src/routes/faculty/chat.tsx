import { createFileRoute } from '@tanstack/react-router'
import { requireAuthenticatedRole } from '../../features/auth/session'
import { facultyScopeLinks } from '../../features/faculty/config'
import SharedChatWorkspacePage from '../../features/shared/chat/pages/SharedChatWorkspacePage'

function FacultyChatPage() {
  return (
    <SharedChatWorkspacePage
      actor="faculty"
      kicker="Faculty shared chat"
      title="Coordinate applicant-facing follow-ups inside one chat workspace."
      description="Use the shared CometChat workspace for role-specific conversations, quick clarifications, and cross-functional coordination without leaving the faculty scope."
      links={facultyScopeLinks.filter((link) => link.to !== '/faculty/chat')}
    />
  )
}

export const Route = createFileRoute('/faculty/chat')({
  beforeLoad: async () => {
    await requireAuthenticatedRole('faculty')
  },
  component: FacultyChatPage,
})
