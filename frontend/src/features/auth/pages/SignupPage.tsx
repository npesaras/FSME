import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
import AuthSplitLayout from '../components/AuthSplitLayout'

export default function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate({ to: '/home' })
  }

  return (
    <AuthSplitLayout
      title="Register"
      subtitle="Please enter your details to sign up"
    >
      <button
        type="button"
        className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
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
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-xs font-medium uppercase text-slate-400">
            OR
          </span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-800">Name</label>
          <div className="relative">
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <User className="h-[15px] w-[15px] text-slate-400" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-800">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Mail className="h-[15px] w-[15px] text-slate-400" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-800">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                <Eye className="h-[15px] w-[15px]" />
              ) : (
                <EyeOff className="h-[15px] w-[15px]" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-800">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm placeholder:text-slate-400 focus:border-[#1E847C] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <Eye className="h-[15px] w-[15px]" />
              ) : (
                <EyeOff className="h-[15px] w-[15px]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-1 pt-1">
          <input
            type="checkbox"
            id="terms"
            required
            className="h-3.5 w-3.5 rounded border-slate-300 text-[#1E847C] accent-[#1E847C] focus:ring-[#1E847C]"
          />
          <label
            htmlFor="terms"
            className="cursor-pointer select-none text-[13px] text-slate-600"
          >
            I Agree to{' '}
            <span className="cursor-pointer font-medium text-[#2563EB] hover:underline">
              Terms &amp; Privacy
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-[#1E847C] px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#156a63] focus:outline-none focus:ring-2 focus:ring-[#1E847C]/50 focus:ring-offset-2"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-6 text-center text-[13px]">
        <span className="text-slate-500">Already have an account? </span>
        <Link
          to="/sign-in"
          className="font-semibold text-[#2563EB] hover:text-blue-700 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </AuthSplitLayout>
  )
}
