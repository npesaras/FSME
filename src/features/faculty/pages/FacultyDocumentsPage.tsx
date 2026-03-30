import { DocumentTrackingTable } from '../components/DocumentTrackingTable'
import ScopePage from '../../shared/components/ScopePage'
import { facultyScopeLinks } from '../config'

interface FacultyDocumentsPageProps {
  accountId: string
}

export default function FacultyDocumentsPage({
  accountId,
}: FacultyDocumentsPageProps) {
  return (
    <ScopePage
      kicker="Faculty documents"
      title="Track every required upload in one place."
      description="This route now owns the live document-tracking workflow so replacements, reviewer remarks, and document status changes stay aligned with the TanStack route that serves them."
      links={facultyScopeLinks.filter((link) => link.to !== '/faculty/documents')}
    >
      <section className="mt-8 space-y-6">
        <DocumentTrackingTable accountId={accountId} />

        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              'Replacement workflow',
              'Use this page as the stable home for future file replacement, version history, and review-driven resubmission actions.',
            ],
            [
              'Checklist alignment',
              'The live Appwrite document rows stay close to the route that renders them, which keeps route loaders and query cache behavior easier to reason about.',
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
        </div>
      </section>
    </ScopePage>
  )
}
