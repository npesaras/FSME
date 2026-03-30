import type { ReactNode } from 'react'
import type { AuthAccount } from '../../auth/types'
import { ScopeWorkspaceShell } from '../../shared/workspace/components/ScopeWorkspaceShell'
import type { ScopeWorkspaceSection } from '../../shared/workspace/types'
import { PanelistSidebar } from './PanelistSidebar'

export type PanelistWorkspaceSection = ScopeWorkspaceSection

interface PanelistWorkspaceShellProps {
  account: AuthAccount
  activeSection: PanelistWorkspaceSection
  children: ReactNode
}

export function PanelistWorkspaceShell({
  account,
  activeSection,
  children,
}: PanelistWorkspaceShellProps) {
  return (
    <ScopeWorkspaceShell
      account={account}
      activeSection={activeSection}
      actor="panelist"
      emptyInitials="PN"
      homePath="/panelist"
      roleLabel={
        account.role === 'panelist' ? 'Panelist reviewer' : 'Panelist account'
      }
      renderSidebar={(sidebarProps) => (
        <PanelistSidebar
          {...sidebarProps}
        />
      )}
    >
      {children}
    </ScopeWorkspaceShell>
  )
}
