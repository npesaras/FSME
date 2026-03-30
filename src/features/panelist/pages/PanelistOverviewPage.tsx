export default function PanelistOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
          Panelist scope
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)]">
          Review, recommend, and record outcomes with a dedicated panelist workspace.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          The panelist area owns reviewer-facing tools: a clean queue, focused evaluation views,
          recommendation support, and final decision recording.
        </p>
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [
            'Queue',
            'See all submitted applications that need panel attention, with enough context to prioritize quickly.',
          ],
          [
            'Assess',
            'Review supporting files, compare applicants against criteria, and write concise notes during deliberation.',
          ],
          [
            'Record',
            'Capture recommendations and outcomes in a way that supports audit logs and final follow-through.',
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
