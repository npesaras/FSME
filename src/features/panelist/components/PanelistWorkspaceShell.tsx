import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { signOut } from '../../auth/api'
import type { AuthAccount } from '../../auth/types'
import { preloadChatWorkspace } from '../../shared/chat/preload'

type PanelistNavItem = {
  icon: ReactNode
  label: string
  section: PanelistWorkspaceSection
  to: '/panelist' | '/panelist/reviews' | '/panelist/decisions' | '/panelist/chat'
  preload?: false | 'intent' | 'viewport' | 'render'
}

export type PanelistWorkspaceSection = 'overview' | 'reviews' | 'decisions' | 'chat'

const navItems: PanelistNavItem[] = [
  {
    icon: <LayoutDashboard size={18} />,
    label: 'Overview',
    section: 'overview',
    to: '/panelist',
  },
  {
    icon: <ClipboardCheck size={18} />,
    label: 'Reviews',
    section: 'reviews',
    to: '/panelist/reviews',
  },
  {
    icon: <Scale size={18} />,
    label: 'Decisions',
    section: 'decisions',
    to: '/panelist/decisions',
  },
  {
    icon: <MessageSquare size={18} />,
    label: 'Chat',
    section: 'chat',
    to: '/panelist/chat',
    preload: 'render',
  },
]

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'PN'
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('')
}

export function PanelistWorkspaceShell({
  account,
  activeSection,
  children,
}: {
  account: AuthAccount
  activeSection: PanelistWorkspaceSection
  children: ReactNode
}) {
  const navigate = useNavigate()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              Panelist workspace
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight [font-family:var(--font-heading)]">
                  Review and decision operations
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  Keep panel review, outcome recording, and coordination inside one protected
                  route branch.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card/80 px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {getInitials(account.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleSignOut()
              }}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-6 pb-4 md:px-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.section

            return (
              <Link
                key={item.to}
                to={item.to}
                preload={item.preload}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold no-underline transition ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
