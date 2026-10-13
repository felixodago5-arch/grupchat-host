export default function Home() {
  return (
    <div className="min-h-screen bg-shell text-ink antialiased">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm font-bold text-white"
            >
              G
            </span>
            GrupChat
          </span>
          <span className="text-sm text-muted">Host app</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your plans, organised in one place
        </h1>
        <p className="mt-4 max-w-prose text-muted">
          Keep track of what still needs doing for every group plan.
        </p>

        <section className="mt-10 rounded-2xl border border-line bg-paper p-6 shadow-card sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Diani, Easter weekend</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-ink">
                6 going
              </span>
              <span>closes in 9 days</span>
            </p>
          </div>
          <a
            href="/chat"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-3 font-medium text-black transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:mt-0"
          >
            Open checklist
          </a>
        </section>

        
      </main>
    </div>
  );
}