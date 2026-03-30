export default function PanelistDecisionsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Panelist decisions
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Keep recommendation and outcome recording in a dedicated decision feature.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          Decision recording deserves its own feature boundary so recommendation values, rationale,
          timestamps, and audit events can evolve without tangling with the review queue.
        </p>
      </div>
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
