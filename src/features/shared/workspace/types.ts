export type ScopeWorkspaceSection =
  | 'dashboard'
  | 'application'
  | 'documents'
  | 'chat'
  | 'account-setting'

export type ScopeBasePath = '/faculty' | '/panelist'

export type ScopeSidebarLinkPath =
  | '/faculty/applications'
  | '/faculty/documents'
  | '/faculty/chat'
  | '/panelist/applications'
  | '/panelist/documents'
  | '/panelist/chat'

export interface ScopeSidebarRenderProps {
  activeSection: ScopeWorkspaceSection
  isSigningOut: boolean
  onAccountSettingsSelect: () => void
  onApplicationSelect: () => void
  onDashboardSelect: () => void
  onSignOut: () => void
}
