import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import {
  AppWindow,
  Bell,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCircle,
} from 'lucide-react'

import { signOut } from '../../auth/api'
import type { AuthAccount } from '../../auth/types'
import { preloadChatWorkspace } from '../../shared/chat/preload'

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  to?: '/faculty/documents' | '/faculty/chat' | '/faculty/applications'
  preload?: false | 'intent' | 'viewport' | 'render'
  onSelect?: () => void
}

export type FacultyWorkspaceSection =
  | 'dashboard'
  | 'application'
  | 'documents'
  | 'chat'
  | 'account-setting'

interface FacultyWorkspaceShellProps {
  account: AuthAccount
  activeSection: FacultyWorkspaceSection
  children: ReactNode
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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'FA'
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('')
}

function getRoleLabel(role: AuthAccount['role']) {
  return role === 'faculty' ? 'Faculty applicant' : 'Panelist'
}

export function FacultyWorkspaceShell({
  account,
  activeSection,
  children,
}: FacultyWorkspaceShellProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const roleLabel = getRoleLabel(account.role)

  useEffect(() => {
    if (activeSection === 'chat') {
      return
    }

    let cancelled = false
    let timeoutId: number | undefined
    let idleId: number | undefined

    const warmChatWorkspace = () => {
      if (cancelled) {
        return
      }

      const chatRoute = router.routesByPath['/faculty/chat']

      if (chatRoute) {
        void router.loadRouteChunk(chatRoute).catch(() => undefined)
      }

      void preloadChatWorkspace('faculty')
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(warmChatWorkspace, {
        timeout: 1200,
      })
    } else {
      timeoutId = window.setTimeout(warmChatWorkspace, 300)
    }

    return () => {
      cancelled = true

      if (
        typeof window !== 'undefined' &&
        idleId !== undefined &&
        'cancelIdleCallback' in window
      ) {
        window.cancelIdleCallback(idleId)
      }

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [activeSection, router])

  const handleSignOut = async () => {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)
    setIsProfileOpen(false)

    try {
      await signOut()
    } finally {
      await router.invalidate()
      await navigate({
        to: '/sign-in',
        replace: true,
      })
      setIsSigningOut(false)
    }
  }

  const handleAccountSettingsNavigation = () => {
    setIsProfileOpen(false)

    if (activeSection === 'account-setting') {
      return
    }

    void navigate({
      to: '/faculty',
      search: {
        view: 'account-setting',
      },
    })
  }

  const handleDashboardNavigation = () => {
    if (activeSection === 'dashboard') {
      return
    }

    void navigate({
      to: '/faculty',
    })
  }

  const handleApplicationNavigation = () => {
    if (activeSection === 'application') {
      return
    }

    void navigate({
      to: '/faculty',
      search: {
        view: 'application',
      },
    })
  }

  return (
    <div className="faculty-shell flex min-h-screen w-full overflow-hidden font-sans text-foreground">
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
            onSelect={handleDashboardNavigation}
          />
          <SidebarItem
            icon={<AppWindow size={20} />}
            label="Application"
            active={activeSection === 'application'}
            onSelect={handleApplicationNavigation}
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
            onSelect={handleAccountSettingsNavigation}
          />

          <div className="mx-4 my-4 border-t border-border/70"></div>

          <SidebarItem
            icon={<LogOut size={20} />}
            label={isSigningOut ? 'Signing Out...' : 'Logout'}
            onSelect={() => {
              void handleSignOut()
            }}
          />
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-card px-6">
          <div className="flex flex-1 items-center gap-4">
            <button type="button" className="md:hidden">
              <Menu className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              className="relative text-muted-foreground transition-colors hover:text-primary"
            >
              <Bell className="h-[22px] w-[22px]" strokeWidth={1.5} />
              <span className="absolute top-[2px] right-[2px] h-[7px] w-[7px] rounded-full border border-background bg-destructive"></span>
            </button>

            <div className="mx-2 hidden h-8 w-px bg-border md:block"></div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-colors hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-bold text-primary shadow-sm">
                  {getInitials(account.name)}
                </div>
                <div className="mr-2 hidden text-left md:block">
                  <p className="text-[14px] leading-tight font-bold text-foreground">
                    {account.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {roleLabel}
                  </p>
                </div>
              </button>

              {isProfileOpen ? (
                <div className="faculty-panel animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 rounded-xl bg-popover py-2 text-popover-foreground shadow-lg">
                  <button
                    type="button"
                    onClick={handleAccountSettingsNavigation}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-foreground transition-colors hover:bg-accent/40 hover:text-primary"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Account Settings
                  </button>
                  <div className="my-1 h-px bg-border"></div>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignOut()
                    }}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    {isSigningOut ? 'Signing Out...' : 'Logout'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
