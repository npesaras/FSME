export default function PanelistReviewsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Panelist review queue
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Build the review queue around speed, clarity, and decision support.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          This page is the natural home for filters, queue states, applicant summaries, document
          inspection, and panelist note-taking.
        </p>
      </div>
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
