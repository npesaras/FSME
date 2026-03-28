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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,#2c8d86_0%,#155852_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.1),transparent_18%),radial-gradient(circle_at_74%_26%,rgba(255,255,255,0.08),transparent_20%),radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.06),transparent_24%)]" />
        <div className="absolute left-[9%] top-[11%] h-40 w-40 rounded-full border border-white/14 bg-white/6 backdrop-blur-[2px]" />
        <div className="absolute right-[10%] top-[17%] h-24 w-24 rounded-[2rem] border border-white/14 bg-white/6 backdrop-blur-[2px]" />
        <div className="absolute left-[18%] top-[40%] h-56 w-56 rounded-[3rem] border border-white/12 bg-white/6 backdrop-blur-[3px]" />
        <div className="absolute right-[16%] top-[48%] h-32 w-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-[2px]" />
        <div className="absolute bottom-[8%] left-[8%] right-[8%] h-28 rounded-[2rem] border border-white/12 bg-white/7 backdrop-blur-[3px]" />
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-8 sm:p-12 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
