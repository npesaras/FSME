import ScopePage from '../../shared/components/ScopePage'

export default function AboutPage() {
  return (
    <ScopePage
      kicker="TanStack structure"
      title="A route tree that stays clean while features stay role-scoped."
      description="Context7’s TanStack Router docs point to two ideas that fit this app well: grouped route folders for organization-only structure and nested route folders for real URL scopes. This setup uses both."
    >
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [
            'Grouped public routes',
            'The (public) route group keeps the home and about files organized without changing / or /about.',
          ],
          [
            'Faculty URLs',
            'The faculty folder creates real URL scope like /faculty and /faculty/applications for applicant workflows.',
          ],
          [
            'Panelist URLs',
            'The panelist folder creates real URL scope like /panelist and /panelist/reviews for review workflows.',
          ],
        ].map(([title, description], index) => (
          <article
            key={title}
            className="island-shell feature-card animate-rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="m-0 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Current split</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          <li>
            <code>src/routes/(public)</code> for public entry pages.
          </li>
          <li>
            <code>src/routes/faculty</code> and <code>src/routes/panelist</code>{' '}
            for role-based URL scope.
          </li>
          <li>
            <code>src/features/public</code>, <code>src/features/faculty</code>,
            and <code>src/features/panelist</code> for actual page implementations.
          </li>
        </ul>
      </section>
    </ScopePage>
  )
}
