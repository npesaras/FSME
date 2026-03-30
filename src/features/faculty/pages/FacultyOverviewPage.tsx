export default function FacultyOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Faculty scope
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Everything a faculty applicant needs in one workflow space.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          The faculty area owns the applicant journey: preparing applications, uploading
          documents, checking readiness, and following status updates after submission.
        </p>
      </div>
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
    </div>
  )
}
