import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import AuthSplitLayout from '../components/AuthSplitLayout'
import {
  authBodyTextClassName,
  authPrimaryLinkButtonClassName,
} from '../components/authClassNames'

export default function ResetPasswordSuccessPage() {
  return (
    <AuthSplitLayout
      title="Success"
      subtitle="Your password has been reset successfully."
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <p className={`${authBodyTextClassName} mb-8 max-w-sm`}>
          You can now return to sign in and continue with your updated password.
        </p>
        <Link
          to="/sign-in"
          className={`${authPrimaryLinkButtonClassName} mt-0`}
        >
          Back to Sign In
        </Link>
      </div>
    </AuthSplitLayout>
  )
}
