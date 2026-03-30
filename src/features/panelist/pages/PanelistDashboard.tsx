import type { AuthAccount } from '../../auth/types'
import { PanelistAccountSettings } from '../components/PanelistAccountSettings'
import { PanelistCalendar } from '../components/PanelistCalendar'
import { PanelistDocumentTrackingTable } from '../components/PanelistDocumentTrackingTable'
import type { PanelistWorkspaceSection } from '../components/PanelistWorkspaceShell'
import { PanelistRecentActivities } from '../components/PanelistRecentActivities'
import {
  PanelistApplicationsFeature,
} from './PanelistApplicationsPage'

export const panelistDashboardViews = [
  'dashboard',
  'application',
  'account-setting',
] as const

export type PanelistDashboardView = (typeof panelistDashboardViews)[number]

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'there'
}

function formatLastSignIn(lastSignInAt: string | null) {
  if (!lastSignInAt) {
    return 'No recent sign-in recorded'
  }

  const parsed = new Date(lastSignInAt)

  if (Number.isNaN(parsed.getTime())) {
    return lastSignInAt
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed)
}

interface PanelistDashboardProps {
  account: AuthAccount
  currentView: Extract<
    PanelistWorkspaceSection,
    'dashboard' | 'application' | 'account-setting'
  >
}

export default function PanelistDashboard({
  account,
  currentView,
}: PanelistDashboardProps) {
  const roleLabel =
    account.role === 'panelist' ? 'Panelist reviewer' : 'Panelist account'

  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      {currentView === 'dashboard' ? (
        <>
          <section className="mb-6">
            <div className="faculty-hero relative flex min-h-[160px] w-full items-center justify-between overflow-hidden rounded-[1.5rem] p-6 text-primary-foreground">
              <div className="relative z-10 flex h-full max-w-[60%] flex-col justify-center">
                <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-primary-foreground/72 uppercase">
                  Panelist Workspace
                </p>
                <h1 className="mb-2 text-2xl font-bold md:text-3xl [font-family:var(--font-heading)]">
                  Welcome back, {getFirstName(account.name)}!
                </h1>
                <p className="text-sm text-primary-foreground/82">
                  {roleLabel}
                </p>
              </div>
              <div className="z-10 hidden pr-8 text-right md:block">
                <div className="text-2xl font-bold text-primary-foreground">
                  {account.status}
                </div>
                <div className="mt-1 text-sm font-semibold text-primary-foreground/72">
                  Last sign-in {formatLastSignIn(account.lastSignInAt)}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="space-y-6 lg:col-span-3">
              <PanelistDocumentTrackingTable accountId={account.id} />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <PanelistCalendar />
              <PanelistRecentActivities accountId={account.id} />
            </div>
          </div>
        </>
      ) : currentView === 'application' ? (
        <div className="space-y-6">
          <PanelistApplicationsFeature />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground [font-family:var(--font-heading)]">
                Account Settings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your profile, security preferences, and personal
                data.
              </p>
            </div>
          </div>
          <PanelistAccountSettings account={account} />
        </div>
      )}
    </div>
  )
}
