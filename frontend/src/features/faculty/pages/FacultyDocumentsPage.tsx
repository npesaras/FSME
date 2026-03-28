import ScopePage from '../../shared/components/ScopePage'
import { facultyScopeLinks } from '../config'

export default function FacultyDocumentsPage() {
  return (
    <ScopePage
      kicker="Faculty documents"
      title="Keep supporting files in a dedicated document workflow."
      description="Faculty document handling belongs in its own feature slice so uploads, file metadata, checklist logic, and replacement flows can evolve independently."
      links={facultyScopeLinks.filter((link) => link.to !== '/faculty/documents')}
    >
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          [
            'Required uploads',
            'Track which files are still missing and which uploads already satisfy the application checklist.',
          ],
          [
            'Version replacement',
            'Allow faculty to swap outdated attachments without rebuilding the whole application.',
          ],
          [
            'Metadata view',
            'Expose upload date, file size, and document type so the application stays auditable.',
          ],
          [
            'Submission lock rules',
            'Prevent incomplete or invalid document sets from slipping into final submission.',
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
