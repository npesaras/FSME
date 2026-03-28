import ScopePage from '../../shared/components/ScopePage'
import { facultyScopeLinks } from '../config'

export default function FacultyOverviewPage() {
  return (
    <ScopePage
      kicker="Faculty scope"
      title="Everything a faculty applicant needs in one workflow space."
      description="The faculty area owns the applicant journey: preparing applications, uploading documents, checking readiness, and following status updates after submission."
      links={facultyScopeLinks}
    >
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [
            'Prepare',
            'Collect profile details, confirm eligibility, and start an application draft early.',
          ],
          [
            'Submit',
            'Attach requirements, review the checklist, and send the application once everything is complete.',
          ],
          [
            'Track',
            'Follow each application through review, revisions, and final decision states.',
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
