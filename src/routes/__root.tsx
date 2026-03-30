import type { RouterContext } from '../router-context'
import {
  HeadContent,
  Scripts,
  Link,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Toaster } from '../components/ui/sonner'
import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark')?stored:'light';window.localStorage.setItem('theme',mode);var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(mode);root.setAttribute('data-theme',mode);root.style.colorScheme=mode;}catch(e){}})();`

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'FSMES Frontend Workspace',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-[min(720px,calc(100%-2rem))] items-center px-4 py-16">
      <section className="island-shell w-full rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">Route not found</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)] sm:text-5xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-muted-foreground">
          Try returning to the sign-in route or, if you already have an active session,
          head back to the faculty dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/sign-in"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition hover:opacity-90"
          >
            Go to Sign In
          </Link>
          <Link
            to="/faculty"
            search={{
              view: 'dashboard',
            }}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition hover:bg-accent/40"
          >
            Go to Faculty
          </Link>
        </div>
      </section>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
        <Toaster position="top-center" />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
