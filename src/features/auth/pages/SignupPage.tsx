import { useCallback, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
import AuthSplitLayout from '../components/AuthSplitLayout'
import {
  authAlertClassName,
  authCompactCheckboxClassName,
  authCompactCheckboxLabelClassName,
  authCompactErrorTextClassName,
  authCompactFieldLabelClassName,
  authCompactInputClassName,
  authCompactPrimaryButtonClassName,
  authCompactTrailingIconClassName,
  authDividerLineClassName,
  authDividerTextClassName,
  authIconButtonClassName,
  authLinkClassName,
  authSocialButtonClassName,
} from '../components/authClassNames'
import { signUp } from '../api'
import {
  existingAccountMessage,
  getAuthPageErrorMessage,
  normalizeEmailInput,
  normalizeNameInput,
  useEmailAvailability,
  useGuardedFormSubmit,
  validateAcceptedTerms,
  validateEmailInput,
  validateFullName,
  validatePasswordConfirmation,
  validateRequiredPassword,
} from '../form-utils'
import { getDefaultAuthenticatedPath } from '../session'

export default function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { emailAvailability, checkEmailExists, trackEmailInput } = useEmailAvailability()
  const clearSubmitError = useCallback(() => {
    setSubmitError((current) => (current ? null : current))
  }, [])
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    onSubmit: async ({ value }) => {
      try {
        clearSubmitError()

        const normalizedEmail = normalizeEmailInput(value.email)
        const normalizedName = normalizeNameInput(value.name)
        const emailExists =
          emailAvailability.email === normalizedEmail && emailAvailability.status === 'exists'
            ? true
            : emailAvailability.email === normalizedEmail &&
                emailAvailability.status === 'available'
              ? false
              : await checkEmailExists(normalizedEmail)

        if (emailExists) {
          setSubmitError(existingAccountMessage)
          return
        }

        const { account } = await signUp({
          name: normalizedName,
          email: normalizedEmail,
          password: value.password,
        })

        await navigate({
          to: getDefaultAuthenticatedPath(account),
          replace: true,
        })
      } catch (error) {
        setSubmitError(getAuthPageErrorMessage(error, 'Unable to create your account right now. Please try again.'))
      }
    },
  })
  const handleFormSubmit = useGuardedFormSubmit(() => form.handleSubmit())

  return (
    <AuthSplitLayout
      title="Register"
      subtitle="Please enter your details to sign up"
    >
      <button
        type="button"
        className={authSocialButtonClassName}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className={authDividerLineClassName} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={authDividerTextClassName}>
            OR
          </span>
        </div>
      </div>

      <form
        noValidate
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        {submitError ? (
          <div className={authAlertClassName}>
            {submitError}
          </div>
        ) : null}

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => validateFullName(value),
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="space-y-1.5">
                <label htmlFor={field.name} className={authCompactFieldLabelClassName}>
                  Name
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearSubmitError()
                      field.handleChange(event.target.value)
                    }}
                    className={authCompactInputClassName}
                    placeholder="Enter your name"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <User className={authCompactTrailingIconClassName} />
                  </div>
                </div>
                {error ? (
                  <p className={authCompactErrorTextClassName}>{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => validateEmailInput(value),
            onBlurAsyncDebounceMs: 250,
            onBlurAsync: async ({ value }) => {
              const emailExists = await checkEmailExists(value)

              return emailExists ? existingAccountMessage : undefined
            },
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined
            const normalizedEmail = normalizeEmailInput(field.state.value)
            const hasExistingAccountError = error === existingAccountMessage
            const isCheckingEmail =
              field.state.meta.isTouched &&
              field.state.meta.isValidating &&
              emailAvailability.email === normalizedEmail &&
              emailAvailability.status === 'checking'
            const hasExistingAccount =
              !hasExistingAccountError &&
              field.state.meta.isTouched &&
              emailAvailability.email === normalizedEmail &&
              emailAvailability.status === 'exists'

            return (
              <div className="space-y-1.5">
                <label htmlFor={field.name} className={authCompactFieldLabelClassName}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={field.state.value}
                    onBlur={() => {
                      field.handleBlur()
                    }}
                    onChange={(event) => {
                      clearSubmitError()
                      trackEmailInput(event.target.value)
                      field.handleChange(event.target.value)
                    }}
                    className={authCompactInputClassName}
                    placeholder="Enter your email"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail className={authCompactTrailingIconClassName} />
                  </div>
                </div>
                {error && !hasExistingAccountError ? (
                  <p className={authCompactErrorTextClassName}>{String(error)}</p>
                ) : null}
                {!error && isCheckingEmail ? (
                  <p className="text-[13px] font-medium text-muted-foreground">
                    Checking if this email already exists...
                  </p>
                ) : null}
                {hasExistingAccountError || hasExistingAccount ? (
                  <p className={authCompactErrorTextClassName}>
                    This email is already registered.{' '}
                    <Link to="/sign-in" className={authLinkClassName}>
                      Sign in instead
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => validateRequiredPassword(value),
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="space-y-1.5">
                <label htmlFor={field.name} className={authCompactFieldLabelClassName}>
                  Password
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
                      clearSubmitError()
                      field.handleChange(event.target.value)
                    }}
                    className={authCompactInputClassName}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className={authIconButtonClassName}
                  >
                    {showPassword ? (
                      <Eye className={authCompactTrailingIconClassName} />
                    ) : (
                      <EyeOff className={authCompactTrailingIconClassName} />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className={authCompactErrorTextClassName}>{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              validatePasswordConfirmation(value, fieldApi.form.getFieldValue('password')),
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="space-y-1.5">
                <label htmlFor={field.name} className={authCompactFieldLabelClassName}>
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
                      clearSubmitError()
                      field.handleChange(event.target.value)
                    }}
                    className={authCompactInputClassName}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className={authIconButtonClassName}
                  >
                    {showConfirmPassword ? (
                      <Eye className={authCompactTrailingIconClassName} />
                    ) : (
                      <EyeOff className={authCompactTrailingIconClassName} />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className={authCompactErrorTextClassName}>{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="terms"
          validators={{
            onChange: ({ value }) => validateAcceptedTerms(value),
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="pb-1 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearSubmitError()
                      field.handleChange(event.target.checked)
                    }}
                    className={authCompactCheckboxClassName}
                  />
                  <label
                    htmlFor={field.name}
                    className={authCompactCheckboxLabelClassName}
                  >
                    I Agree to{' '}
                    <span className="cursor-pointer font-medium text-primary hover:underline">
                      Terms &amp; Privacy
                    </span>
                  </label>
                </div>
                {error ? (
                  <p className="mt-1.5 text-[13px] font-medium text-destructive">{String(error)}</p>
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
              disabled={
                !canSubmit ||
                isSubmitting ||
                emailAvailability.status === 'checking' ||
                emailAvailability.status === 'exists'
              }
              className={authCompactPrimaryButtonClassName}
            >
              {isSubmitting
                ? 'Signing Up...'
                : emailAvailability.status === 'checking'
                  ? 'Checking Email...'
                  : 'Sign Up'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-6 text-center text-[13px]">
        <span className="text-muted-foreground">Already have an account? </span>
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
