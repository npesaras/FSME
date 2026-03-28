import ScopePage from '../../shared/components/ScopePage'
import { panelistScopeLinks } from '../config'

export default function PanelistDecisionsPage() {
  return (
    <ScopePage
      kicker="Panelist decisions"
      title="Keep recommendation and outcome recording in a dedicated decision feature."
      description="Decision recording deserves its own feature boundary so recommendation values, rationale, timestamps, and audit events can evolve without tangling with the review queue."
      links={panelistScopeLinks.filter((link) => link.to !== '/panelist/decisions')}
    >
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          [
            'Recommendation capture',
            'Record outcomes like recommended, not recommended, or returned for revision with confidence.',
          ],
          [
            'Rationale fields',
            'Keep notes, comments, and supporting explanation close to the decision itself.',
          ],
          [
            'Audit alignment',
            'Make it easy to trigger or later connect activity log events for review and decision actions.',
          ],
          [
            'Workflow completion',
            'Show which decisions are still pending and which applications have moved into a recorded state.',
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
    </ScopePage>
  )
}
