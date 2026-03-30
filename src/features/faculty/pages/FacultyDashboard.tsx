import type { AuthAccount } from '../../auth/types'
import { AccountSettings } from '../components/AccountSettings'
import { Calendar } from '../components/Calendar'
import { DocumentTrackingTable } from '../components/DocumentTrackingTable'
import {
  FacultyWorkspaceShell,
  type FacultyWorkspaceSection,
} from '../components/FacultyWorkspaceShell'
import { RecentActivities } from '../components/RecentActivities'
import { ScholarshipApplication } from '../components/ScholarshipApplication'

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

interface FacultyDashboardProps {
  account: AuthAccount
  currentView: Extract<
    FacultyWorkspaceSection,
    'dashboard' | 'application' | 'account-setting'
  >
}

export default function FacultyDashboard({
  account,
  currentView,
}: FacultyDashboardProps) {
  const roleLabel = account.role === 'faculty' ? 'Faculty applicant' : 'Panelist'

  return (
    <FacultyWorkspaceShell account={account} activeSection={currentView}>
      <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
        {currentView === 'dashboard' ? (
          <>
            <section className="mb-6">
              <div className="faculty-hero relative flex min-h-[160px] w-full items-center justify-between overflow-hidden rounded-[1.5rem] p-6 text-primary-foreground">
                <div className="relative z-10 flex h-full max-w-[60%] flex-col justify-center">
                  <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-primary-foreground/72 uppercase">
                    Faculty Workspace
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
                <DocumentTrackingTable accountId={account.id} />
              </div>
              <div className="space-y-6 lg:col-span-1">
                <Calendar />
                <RecentActivities accountId={account.id} />
              </div>
            </div>
          </>
        ) : currentView === 'application' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
                Faculty Scholarship Application
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete your application for the upcoming faculty development
                program.
              </p>
            </div>
            <ScholarshipApplication />
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
            <AccountSettings />
          </div>
        )}
      </div>
    </FacultyWorkspaceShell>
  )
}
