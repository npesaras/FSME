import { Link } from '@tanstack/react-router'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-border px-4 pb-14 pt-10 text-muted-foreground">
      <div className="mx-auto flex w-[min(1080px,calc(100%-2rem))] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} FSMES workflow prototype. All rights reserved.
        </p>
        <p className="island-kicker m-0">Faculty and panelist feature scopes</p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-semibold">
        <Link
          to="/faculty"
          className="rounded-full border border-border/70 bg-card/85 px-4 py-2 text-foreground no-underline shadow-sm transition hover:bg-accent/40"
        >
          Faculty
        </Link>
        <Link
          to="/panelist"
          className="rounded-full border border-border/70 bg-card/85 px-4 py-2 text-foreground no-underline shadow-sm transition hover:bg-accent/40"
        >
          Panelist
        </Link>
        <Link
          to="/about"
          className="rounded-full border border-border/70 bg-card/85 px-4 py-2 text-foreground no-underline shadow-sm transition hover:bg-accent/40"
        >
          About
        </Link>
      </div>
    </footer>
  )
}
