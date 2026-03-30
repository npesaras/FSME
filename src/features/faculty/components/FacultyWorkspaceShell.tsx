import type { ReactNode } from 'react'
import type { AuthAccount } from '../../auth/types'
import { ScopeWorkspaceShell } from '../../shared/workspace/components/ScopeWorkspaceShell'
import type { ScopeWorkspaceSection } from '../../shared/workspace/types'
import { FacultySidebar } from './FacultySidebar'

export type FacultyWorkspaceSection = ScopeWorkspaceSection

interface FacultyWorkspaceShellProps {
  account: AuthAccount
  activeSection: FacultyWorkspaceSection
  children: ReactNode
}

export function FacultyWorkspaceShell({
  account,
  activeSection,
  children,
}: FacultyWorkspaceShellProps) {
  return (
    <ScopeWorkspaceShell
      account={account}
      activeSection={activeSection}
      actor="faculty"
      emptyInitials="FA"
      homePath="/faculty"
      roleLabel={account.role === 'faculty' ? 'Faculty applicant' : 'Panelist'}
      renderSidebar={(sidebarProps) => (
        <FacultySidebar
          {...sidebarProps}
        />
      )}
    >
      {children}
    </ScopeWorkspaceShell>
  )
}
