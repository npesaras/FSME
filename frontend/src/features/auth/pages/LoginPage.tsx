import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Mail } from 'lucide-react'
import AuthSplitLayout from '../components/AuthSplitLayout'
import { AuthApiError, saveAuthSession, signIn } from '../api'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)

        const session = await signIn({
          email: value.email,
          password: value.password,
        })

        saveAuthSession(session)
        navigate({ to: '/home' })
      } catch (error) {
        setSubmitError(
          error instanceof AuthApiError
            ? error.message
            : 'Unable to sign in right now. Please try again.'
        )
      }
    },
  })

  return (
    <AuthSplitLayout
      title="Welcome"
      subtitle="Please enter your details to sign in"
    >
      <button
        type="button"
        className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
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

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            OR
          </span>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-5"
      >
        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        ) : null}

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
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold text-slate-900"
                >
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
                    onChange={(event) => field.handleChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
                    placeholder="Enter your email"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
                {error ? (
                  <p className="text-sm font-medium text-red-600">{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!value) {
                return 'Password is required'
              }

              if (value.length < 8) {
                return 'Password must be at least 8 characters'
              }

              return undefined
            },
          }}
        >
          {(field) => {
            const error = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined

            return (
              <div className="space-y-1.5">
                <label
                  htmlFor={field.name}
                  className="text-sm font-semibold text-slate-900"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error ? (
                  <p className="text-sm font-medium text-red-600">{String(error)}</p>
                ) : null}
              </div>
            )
          }}
        </form.Field>

        <div className="flex items-center justify-between pt-1">
          <form.Field name="remember">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1E847C] accent-[#1E847C] focus:ring-[#1E847C]"
                />
                <label
                  htmlFor={field.name}
                  className="cursor-pointer select-none text-sm font-medium text-slate-700"
                >
                  Remember Me
                </label>
              </div>
            )}
          </form.Field>

          <button
            type="button"
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="mt-4 w-full rounded-lg bg-[#1E847C] px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#156a63] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-slate-600">Don&apos;t have an account? </span>
        <Link
          to="/signup"
          className="font-semibold text-[#156a63] hover:text-[#0d4f4f] hover:underline"
        >
          Create Account
        </Link>
      </div>
    </AuthSplitLayout>
  )
}
