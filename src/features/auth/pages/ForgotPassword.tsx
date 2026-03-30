import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { forgotPassword } from '../api'
import AuthSplitLayout from '../components/AuthSplitLayout'
import {
  authBodyTextClassName,
  authErrorTextClassName,
  authFieldLabelClassName,
  authInputClassName,
  authLinkClassName,
  authPrimaryButtonClassName,
  authPrimaryLinkButtonClassName,
  authTrailingIconClassName,
} from '../components/authClassNames'
import { showAuthErrorToast } from '../form-utils'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const forgotPasswordErrorToastId = 'auth-forgot-password-error'

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      try {
        toast.dismiss(forgotPasswordErrorToastId)

        const response = await forgotPassword({
          email: value.email,
        })

        setSuccessMessage(response.message)
      } catch (error) {
        showAuthErrorToast({
          error,
          fallbackMessage: 'Unable to send reset instructions right now. Please try again.',
          id: forgotPasswordErrorToastId,
        })
      }
    },
  })

  if (successMessage) {
    return (
      <AuthSplitLayout
        title="Check your email"
        subtitle={successMessage}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <p className={`${authBodyTextClassName} mb-8 max-w-sm`}>
            Use the recovery link in your inbox to set a new password for your account.
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

  return (
    <AuthSplitLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send reset instructions if an account matches it."
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value) {
                return 'Email is required'
              }

              if (!emailPattern.test(value)) {
                return 'Enter a valid email address'
              }

              return undefined
            },
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="space-y-1.5">
                <label htmlFor={field.name} className={authFieldLabelClassName}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      toast.dismiss(forgotPasswordErrorToastId)
                      field.handleChange(event.target.value)
                    }}
                    className={authInputClassName}
                    placeholder="Enter your email"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail className={authTrailingIconClassName} />
                  </div>
                </div>
                {error ? (
                  <p className={authErrorTextClassName}>{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`${authPrimaryButtonClassName} mt-0`}
            >
              {isSubmitting ? 'Sending...' : 'Send Instructions'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Return to </span>
        <Link
          to="/sign-in"
          className={authLinkClassName}
        >
          Sign In
        </Link>
      </div>
    </AuthSplitLayout>
  )
}
