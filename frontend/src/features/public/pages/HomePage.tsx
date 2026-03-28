import ScopePage, { type ScopeLink } from '../../shared/components/ScopePage'

const workspaceLinks: ScopeLink[] = [
  {
    label: 'Actor scope',
    title: 'Faculty workspace',
    description:
      'Own the applicant-side experience: submissions, supporting documents, eligibility, and status tracking.',
    to: '/faculty',
  },
  {
    label: 'Actor scope',
    title: 'Panelist workspace',
    description:
      'Own the review-side experience: queue triage, evaluation notes, recommendation flow, and decisions.',
    to: '/panelist',
  },
  {
    label: 'Structure',
    title: 'Architecture notes',
    description:
      'See how the routes and features are split so TanStack Start stays route-first while your product logic stays feature-first.',
    to: '/about',
  },
]

export default function HomePage() {
  return (
    <ScopePage
      kicker="Feature-driven frontend"
      title="Organize your TanStack app by actor, then by workflow."
      description="This frontend is now structured so public routes stay thin while the real UI lives inside scoped features. Faculty and panelist each get their own pages, route entries, and workflow surface area."
      links={workspaceLinks}
    >
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [
            'Public route group',
            'Public pages live in src/routes/(public) so they stay organized without adding extra URL segments.',
          ],
          [
            'Faculty feature scope',
            'Faculty code lives under src/features/faculty and owns the applicant-facing workflows.',
          ],
          [
            'Panelist feature scope',
            'Panelist code lives under src/features/panelist and owns the reviewer-facing workflows.',
          ],
        ].map(([title, description], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm leading-7 text-[var(--sea-ink-soft)]">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Folder intent</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--sea-ink-soft)]">
          <li>
            Keep route files focused on TanStack route registration and import the
            actual page UI from <code>src/features/*</code>.
          </li>
          <li>
            Put faculty-only components, data shaping, and pages under{' '}
            <code>src/features/faculty</code>.
          </li>
          <li>
            Put panelist-only components, review tools, and pages under{' '}
            <code>src/features/panelist</code>.
          </li>
        </ul>
      </section>
    </ScopePage>
  )
}
