import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { requireAuthenticatedRole } from '../../features/auth/session'
import {
  FacultyWorkspaceShell,
  type FacultyWorkspaceSection,
} from '../../features/faculty/components/FacultyWorkspaceShell'

export const Route = createFileRoute('/faculty')({
  beforeLoad: async () => ({
    account: await requireAuthenticatedRole('faculty'),
  }),
  component: FacultyRouteLayout,
})

function FacultyRouteLayout() {
  const { account } = Route.useRouteContext()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  })

  const activeSection = getActiveSection({
    pathname,
    searchStr,
  })

  return (
    <FacultyWorkspaceShell account={account} activeSection={activeSection}>
      <Outlet />
    </FacultyWorkspaceShell>
  )
}

function getActiveSection({
  pathname,
  searchStr,
}: {
  pathname: string
  searchStr: string
}): FacultyWorkspaceSection {
  if (pathname === '/faculty/documents') {
    return 'documents'
  }

  if (pathname === '/faculty/chat') {
    return 'chat'
  }

  if (pathname === '/faculty/applications') {
    return 'application'
  }

  const params = new URLSearchParams(searchStr)
  const view = params.get('view')

  if (view === 'application' || view === 'account-setting') {
    return view
  }

  return 'dashboard'
}
