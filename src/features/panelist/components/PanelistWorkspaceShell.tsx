import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import {
  Bell,
  LogOut,
  Menu,
  Settings,
} from 'lucide-react'

import { signOut } from '../../auth/api'
import type { AuthAccount } from '../../auth/types'
import { preloadChatWorkspace } from '../../shared/chat/preload'
import { PanelistSidebar } from './PanelistSidebar'

export type PanelistWorkspaceSection =
  | 'dashboard'
  | 'application'
  | 'documents'
  | 'chat'
  | 'account-setting'

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
  const navigate = useNavigate()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const roleLabel = account.role === 'panelist' ? 'Panelist reviewer' : 'Panelist account'

  useEffect(() => {
    if (activeSection === 'chat') {
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let idleId: number | undefined

    const warmChatWorkspace = () => {
      if (cancelled) {
        return
      }

      void preloadChatWorkspace('panelist')
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(warmChatWorkspace, {
        timeout: 1200,
      })
    } else {
      timeoutId = setTimeout(warmChatWorkspace, 300)
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
        clearTimeout(timeoutId)
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
      to: '/panelist',
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
      to: '/panelist',
      search: {
        view: 'dashboard',
      },
    })
  }

  const handleApplicationNavigation = () => {
    if (activeSection === 'application') {
      return
    }

    void navigate({
      to: '/panelist',
      search: {
        view: 'application',
      },
    })
  }

  return (
    <div className="faculty-shell flex min-h-screen w-full overflow-hidden font-sans text-foreground">
      <PanelistSidebar
        activeSection={activeSection}
        isSigningOut={isSigningOut}
        onAccountSettingsSelect={handleAccountSettingsNavigation}
        onApplicationSelect={handleApplicationNavigation}
        onDashboardSelect={handleDashboardNavigation}
        onSignOut={() => {
          void handleSignOut()
        }}
      />

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
                  {account.name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() || '')
                    .join('') || 'PN'}
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
