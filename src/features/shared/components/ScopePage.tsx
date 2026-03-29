import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export type ScopeLink = {
  title: string
  description: string
  to: string
  label: string
}

type ScopePageProps = {
  kicker: string
  title: string
  description: string
  links?: ScopeLink[]
  children?: ReactNode
}

export default function ScopePage({
  kicker,
  title,
  description,
  links = [],
  children,
}: ScopePageProps) {
  return (
    <main className="mx-auto w-[min(1080px,calc(100%-2rem))] px-4 pb-10 pt-14">
      <section className="island-shell animate-rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--secondary)_0%,transparent_66%)] opacity-30" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_66%)] opacity-[0.16]" />
        <p className="island-kicker mb-3">{kicker}</p>
        <h1 className="mb-5 max-w-4xl text-4xl leading-[1.02] font-bold tracking-tight text-foreground [font-family:var(--font-heading)] sm:text-6xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </section>

      {links.length > 0 ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className="island-shell feature-card animate-rise-in rounded-2xl p-5 no-underline"
              style={{ animationDelay: `${index * 80 + 80}ms` }}
            >
              <p className="island-kicker mb-2">{link.label}</p>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                {link.title}
              </h2>
              <p className="m-0 text-sm leading-7 text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </section>
      ) : null}

      {children}
    </main>
  )
}
