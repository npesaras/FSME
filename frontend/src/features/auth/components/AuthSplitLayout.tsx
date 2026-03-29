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
    <div className="auth-light flex min-h-screen w-full items-center justify-center bg-muted/55 p-4 font-sans sm:p-8">
      <div className="flex w-full max-w-[1000px] overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-[0_28px_80px_rgba(3,2,19,0.08)]">
        <div
          aria-hidden="true"
          className="relative hidden min-h-[600px] overflow-hidden bg-muted lg:flex lg:w-1/2"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center text-foreground/35">
            <svg
              className="mb-4 h-16 w-16 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-medium">Image Placeholder</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-card p-8 sm:p-12 lg:min-h-[600px] lg:w-1/2 lg:p-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="mb-2 text-[28px] font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
