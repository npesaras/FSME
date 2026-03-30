import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AppWindow,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  UserCircle,
} from 'lucide-react'
import type { FacultyWorkspaceSection } from './FacultyWorkspaceShell'

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  to?: '/faculty/documents' | '/faculty/chat' | '/faculty/applications'
  preload?: false | 'intent' | 'viewport' | 'render'
  onSelect?: () => void
}

interface FacultySidebarProps {
  activeSection: FacultyWorkspaceSection
  isSigningOut: boolean
  onAccountSettingsSelect: () => void
  onApplicationSelect: () => void
  onDashboardSelect: () => void
  onSignOut: () => void
}

function SidebarItem({
  icon,
  label,
  active,
  to,
  preload,
  onSelect,
}: NavItemProps) {
  const className = `flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
    active
      ? 'border-r-4 border-primary bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
  }`

  if (to) {
    return (
      <Link
        to={to}
        preload={preload}
        className={className}
      >
        <div className={active ? 'text-primary' : 'text-muted-foreground'}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={className}
    >
      <div className={active ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

export function FacultySidebar({
  activeSection,
  isSigningOut,
  onAccountSettingsSelect,
  onApplicationSelect,
  onDashboardSelect,
  onSignOut,
}: FacultySidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border/80 bg-card md:flex">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Globe className="h-5 w-5" />
        </div>
        <span className="text-xl leading-tight font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Tanaw School System
        </span>
      </div>

      <nav className="flex-1 space-y-1 py-4">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={activeSection === 'dashboard'}
          onSelect={onDashboardSelect}
        />
        <SidebarItem
          icon={<AppWindow size={20} />}
          label="Apply for Scholarships"
          active={activeSection === 'application'}
          onSelect={onApplicationSelect}
        />
        <SidebarItem
          icon={<FileText size={20} />}
          label="Documents"
          active={activeSection === 'documents'}
          to="/faculty/documents"
        />
        <SidebarItem
          icon={<MessageSquare size={20} />}
          label="Chat"
          active={activeSection === 'chat'}
          to="/faculty/chat"
          preload="render"
        />
        <SidebarItem
          icon={<UserCircle size={20} />}
          label="Account Settings"
          active={activeSection === 'account-setting'}
          onSelect={onAccountSettingsSelect}
        />

        <div className="mx-4 my-4 border-t border-border/70"></div>

        <SidebarItem
          icon={<LogOut size={20} />}
          label={isSigningOut ? 'Signing Out...' : 'Logout'}
          onSelect={onSignOut}
        />
      </nav>
    </aside>
  )
}
