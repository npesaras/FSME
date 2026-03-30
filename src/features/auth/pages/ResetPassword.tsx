import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { resetPassword } from '../api'
import AuthSplitLayout from '../components/AuthSplitLayout'
import {
  authBodyTextClassName,
  authErrorTextClassName,
  authFieldLabelClassName,
  authIconButtonClassName,
  authInputClassName,
  authLinkClassName,
  authPrimaryButtonClassName,
  authTrailingIconClassName,
} from '../components/authClassNames'
import { showAuthErrorToast } from '../form-utils'

const resetPasswordRoute = getRouteApi('/(public)/reset-password')
const resetPasswordErrorToastId = 'auth-reset-password-error'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { userId, secret } = resetPasswordRoute.useSearch()
  const hasRecoveryLink = Boolean(userId && secret)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (!hasRecoveryLink) {
        toast.error('This password reset link is invalid or has expired.', {
          id: resetPasswordErrorToastId,
        })
        return
      }

      try {
        toast.dismiss(resetPasswordErrorToastId)

        await resetPassword({
          userId,
          secret,
          password: value.password,
        })

        navigate({
          to: '/reset-success',
        })
      } catch (error) {
        showAuthErrorToast({
          error,
          fallbackMessage: 'Unable to reset your password right now. Please try again.',
          id: resetPasswordErrorToastId,
        })
      }
    },
  })

  if (!hasRecoveryLink) {
    return (
      <AuthSplitLayout
        title="Link unavailable"
        subtitle="This password reset link is missing required details or has expired."
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <ShieldAlert className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <p className={`${authBodyTextClassName} mb-6 max-w-sm`}>
            Request a new recovery email and use the most recent reset link we send you.
          </p>
          <Link
            to="/forgot-password"
            className={`${authPrimaryButtonClassName} mt-0 inline-flex items-center justify-center no-underline hover:text-primary-foreground`}
          >
            Request a New Link
          </Link>
          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Return to </span>
            <Link
              to="/sign-in"
              className={authLinkClassName}
            >
              Sign In
            </Link>
          </div>
        </div>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout
      title="Reset Password"
      subtitle="Choose a new password for your account and confirm it to finish recovery."
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!value) {
                return 'Password is required'
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
                  New Password
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      toast.dismiss(resetPasswordErrorToastId)
                      field.handleChange(event.target.value)
                    }}
                    className={authInputClassName}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className={authIconButtonClassName}
                  >
                    {showPassword ? (
                      <Eye className={authTrailingIconClassName} />
                    ) : (
                      <EyeOff className={authTrailingIconClassName} />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className={authErrorTextClassName}>{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              if (!value) {
                return 'Confirm your password'
              }

              if (value !== fieldApi.form.getFieldValue('password')) {
                return 'Passwords do not match'
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      toast.dismiss(resetPasswordErrorToastId)
                      field.handleChange(event.target.value)
                    }}
                    className={authInputClassName}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className={authIconButtonClassName}
                  >
                    {showConfirmPassword ? (
                      <Eye className={authTrailingIconClassName} />
                    ) : (
                      <EyeOff className={authTrailingIconClassName} />
                    )}
                  </button>
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
              className={`${authPrimaryButtonClassName} mt-2`}
            >
              {isSubmitting ? 'Updating...' : 'Change Password'}
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
