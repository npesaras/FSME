import { Link, useRouterState } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

const navLinkClassName =
  "relative inline-flex items-center text-sm font-semibold text-muted-foreground no-underline transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,var(--secondary),var(--primary))] after:transition-transform after:content-[''] hover:text-foreground hover:after:scale-x-100"

const activeNavLinkClassName = 'text-foreground after:scale-x-100'

export default function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isAuthRoute = pathname === '/sign-in' || pathname === '/signup'

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 px-4 backdrop-blur-lg">
      <nav className="mx-auto flex w-[min(1080px,calc(100%-2rem))] flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-sm text-foreground no-underline shadow-sm transition hover:bg-accent/40 sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,var(--secondary),var(--primary))]" />
            FSMES Frontend
          </Link>
        </h2>

        <div className="ml-auto flex items-center gap-2">
          {isAuthRoute ? null : (
            <Link
              to="/sign-in"
              className="hidden rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-sm font-semibold text-muted-foreground no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/40 hover:text-foreground sm:inline-flex"
            >
              Sign In
            </Link>
          )}
          <a
            href="https://tanstack.com/start/latest/docs/framework/react/overview"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-sm font-semibold text-muted-foreground no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/40 hover:text-foreground sm:inline-flex"
          >
            TanStack Docs
          </a>
          <ThemeToggle />
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/faculty"
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
          >
            Faculty
          </Link>
          <Link
            to="/panelist"
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
          >
            Panelist
          </Link>
          <Link
            to="/about"
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  )
}
