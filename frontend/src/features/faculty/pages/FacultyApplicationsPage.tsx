import ScopePage from '../../shared/components/ScopePage'
import { facultyScopeLinks } from '../config'

export default function FacultyApplicationsPage() {
  return (
    <ScopePage
      kicker="Faculty applications"
      title="Shape the application workflow around draft, submit, and revise."
      description="This page is the natural home for your faculty application list, draft editor, validation status, and submission readiness logic."
      links={facultyScopeLinks.filter((link) => link.to !== '/faculty/applications')}
    >
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          [
            'Draft management',
            'Show active drafts, edit history, and missing-field prompts before a faculty member submits.',
          ],
          [
            'Submission readiness',
            'Surface unmet requirements, document gaps, and final confirmation before the workflow moves forward.',
          ],
          [
            'Revision loop',
            'Handle returned applications cleanly so faculty can update and resubmit without losing progress.',
          ],
          [
            'Status timeline',
            'Give a simple narrative of draft, submitted, under review, returned, and decision-recorded states.',
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
    </ScopePage>
  )
}
