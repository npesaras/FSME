import type { ReactNode } from 'react'

type AuthSplitLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      <div
        aria-hidden="true"
        className="relative hidden overflow-hidden lg:block lg:w-1/2"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2c8d86_0%,#155852_100%)]" />
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-8 sm:p-12 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
