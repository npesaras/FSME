import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { requireAuthenticatedRole } from '../../features/auth/session'
import {
  PanelistWorkspaceShell,
  type PanelistWorkspaceSection,
} from '../../features/panelist/components/PanelistWorkspaceShell'

export const Route = createFileRoute('/panelist')({
  beforeLoad: async () => ({
    account: await requireAuthenticatedRole('panelist'),
  }),
  component: PanelistRouteLayout,
})

function PanelistRouteLayout() {
  const { account } = Route.useRouteContext()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <PanelistWorkspaceShell
      account={account}
      activeSection={getActiveSection(pathname)}
    >
      <Outlet />
    </PanelistWorkspaceShell>
  )
}

function getActiveSection(pathname: string): PanelistWorkspaceSection {
  if (pathname === '/panelist/reviews') {
    return 'reviews'
  }

  if (pathname === '/panelist/decisions') {
    return 'decisions'
  }

  if (pathname === '/panelist/chat') {
    return 'chat'
  }

  return 'overview'
}
