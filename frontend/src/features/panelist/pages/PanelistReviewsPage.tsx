import ScopePage from '../../shared/components/ScopePage'
import { panelistScopeLinks } from '../config'

export default function PanelistReviewsPage() {
  return (
    <ScopePage
      kicker="Panelist review queue"
      title="Build the review queue around speed, clarity, and decision support."
      description="This page is the natural home for filters, queue states, applicant summaries, document inspection, and panelist note-taking."
      links={panelistScopeLinks.filter((link) => link.to !== '/panelist/reviews')}
    >
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          [
            'Queue filters',
            'Break the review workload down by status, academic year, program, or submission completeness.',
          ],
          [
            'Application context',
            'Give panelists enough information to review quickly without bouncing across unrelated screens.',
          ],
          [
            'Notes and flags',
            'Keep reviewer notes, concern markers, and recommendation prep inside the same feature slice.',
          ],
          [
            'Handoff to decision',
            'Move cleanly from individual review into recommendation and final recording workflows.',
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
