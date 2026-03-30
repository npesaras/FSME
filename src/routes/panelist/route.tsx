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
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  })

  return (
    <PanelistWorkspaceShell
      account={account}
      activeSection={getActiveSection({
        pathname,
        searchStr,
      })}
    >
      <Outlet />
    </PanelistWorkspaceShell>
  )
}

function getActiveSection({
  pathname,
  searchStr,
}: {
  pathname: string
  searchStr: string
}): PanelistWorkspaceSection {
  if (pathname === '/panelist/documents') {
    return 'documents'
  }

  if (pathname === '/panelist/chat') {
    return 'chat'
  }

  if (pathname === '/panelist/applications') {
    return 'application'
  }

  const params = new URLSearchParams(searchStr)
  const view = params.get('view')

  if (view === 'application' || view === 'account-setting') {
    return view
  }

  return 'dashboard'
}
