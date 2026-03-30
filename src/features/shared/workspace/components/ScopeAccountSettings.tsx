import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { deleteAccount } from '@/features/auth/api'
import type { AuthAccount } from '@/features/auth/types'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${checked ? 'bg-foreground' : 'bg-switch-background'} relative inline-flex h-[24px] w-[44px] flex-shrink-0 items-center rounded-full transition-colors focus:outline-none`}
  >
    <span
      className={`${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'} inline-block h-[20px] w-[20px] transform rounded-full bg-background shadow-sm transition-transform`}
    />
  </button>
)

function getNameParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0] ?? '',
      lastName: '',
    }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1) ?? '',
  }
}

interface ScopeAccountSettingsProps {
  account: AuthAccount
}

export function ScopeAccountSettings({
  account,
}: ScopeAccountSettingsProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const [twoStep, setTwoStep] = useState(true)
  const [supportAccess, setSupportAccess] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { firstName, lastName } = getNameParts(account.name)

  const handleDeleteDialogOpenChange = (nextOpen: boolean) => {
    if (isDeletingAccount) {
      return
    }

    setDeleteError(null)
    setIsDeleteDialogOpen(nextOpen)
  }

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) {
      return
    }

    setIsDeletingAccount(true)
    setDeleteError(null)

    try {
      await deleteAccount()
      setIsDeleteDialogOpen(false)
      await router.invalidate()
      await navigate({
        to: '/sign-in',
        replace: true,
      })
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'We could not delete your account right now. Please try again.',
      )
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="faculty-panel animate-in fade-in flex-1 w-full rounded-lg p-8 duration-500 md:p-12">
      <div className="max-w-[800px]">
        <h2 className="mb-4 text-[20px] font-bold text-foreground">
          My Profile
        </h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="mb-10 flex items-center gap-6">
          <img
            src="https://images.unsplash.com/photo-1762445422858-49a118151881?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWlkZGxlJTIwYWdlZCUyMG1hbiUyMHBvcnRyYWl0JTIwZ3JheSUyMGhhaXJ8ZW58MXx8fHwxNzc0NzUyMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Profile"
            className="h-[72px] w-[72px] rounded-full border border-border/50 object-cover"
          />
          <div className="flex flex-col">
            <div className="mb-2 flex gap-3">
              <button className="faculty-button-solid flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold shadow-sm transition-colors">
                <Plus className="h-4 w-4" /> Change Image
              </button>
              <button className="faculty-button-muted rounded-md px-4 py-2 text-[13px] font-semibold transition-colors">
                Remove Image
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground">
              We support PNGs, JPEGs and GIFs under 2MB
            </p>
          </div>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-foreground">
              First Name
            </label>
            <input
              type="text"
              defaultValue={firstName}
              className="faculty-input w-full rounded-md px-3 py-2.5 text-[14px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-foreground">
              Last Name
            </label>
            <input
              type="text"
              defaultValue={lastName}
              className="faculty-input w-full rounded-md px-3 py-2.5 text-[14px]"
            />
          </div>
        </div>

        <h2 className="mb-4 text-[20px] font-bold text-foreground">
          Account Security
        </h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="mb-12 flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div className="max-w-[400px] flex-1 space-y-2">
              <label className="text-[14px] font-bold text-foreground">
                Email
              </label>
              <input
                type="text"
                defaultValue={account.email}
                disabled
                className="w-full cursor-not-allowed rounded-md border border-border/60 bg-accent/35 px-3 py-2.5 text-[14px] text-muted-foreground outline-none"
              />
            </div>
            <button className="faculty-button-muted h-[42px] whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
              Change email
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="max-w-[400px] flex-1 space-y-2">
              <label className="text-[14px] font-bold text-foreground">
                Password
              </label>
              <input
                type="password"
                defaultValue="**********"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-border/60 bg-accent/35 px-3 py-2.5 text-[14px] tracking-[0.2em] text-muted-foreground outline-none"
              />
            </div>
            <button className="faculty-button-muted h-[42px] whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
              Change password
            </button>
          </div>
        </div>

        <div className="mb-10 flex items-center justify-between py-2">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">
              2-Step Verifications
            </h3>
            <p className="text-[13px] text-muted-foreground">
              Add an additional layer of security to your account during login.
            </p>
          </div>
          <Toggle checked={twoStep} onChange={() => setTwoStep(!twoStep)} />
        </div>

        <h2 className="mb-4 text-[20px] font-bold text-foreground">
          Support Access
        </h2>
        <div className="mb-8 h-px w-full bg-border/60"></div>

        <div className="mb-6 flex items-center justify-between py-2">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-foreground">
              Support access
            </h3>
            <p className="text-[13px] text-muted-foreground">
              You have granted us to access to your account for support
              purposes until Aug 31, 2023, 9:40 PM.
            </p>
          </div>
          <Toggle
            checked={supportAccess}
            onChange={() => setSupportAccess(!supportAccess)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between py-2">
          <div className="pr-4">
            <h3 className="mb-1 text-[15px] font-bold text-destructive">
              Delete my account
            </h3>
            <p className="text-[13px] text-muted-foreground">
              Permanently delete the account and remove access from all
              workspaces.
            </p>
          </div>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={handleDeleteDialogOpenChange}
          >
            <AlertDialogTrigger asChild>
              <button className="faculty-button-muted whitespace-nowrap rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors">
                Delete Account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your Appwrite account, removes your
                  mirrored workspace profile, and signs you out on this browser.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="rounded-lg border border-border/70 bg-accent/20 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {account.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.name} will lose access to all FSMES workspaces
                  immediately.
                </p>
              </div>

              {deleteError ? (
                <p role="alert" className="text-sm text-destructive">
                  {deleteError}
                </p>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAccount}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                >
                  {isDeletingAccount
                    ? 'Deleting account...'
                    : 'Delete account'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
