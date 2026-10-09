export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">GrupChat</span>
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

        <section className="mt-10 rounded-2xl border border-line bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Diani, Easter weekend</h2>
            <p className="mt-1 text-sm text-muted">6 going, closes in 9 days</p>
          </div>
          <a
            href="/chat"
            className="mt-4 inline-block rounded-lg bg-ink px-5 py-3 font-medium text-white hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:mt-0"
          >
            Open checklist
          </a>
        </section>

        <p className="mt-10 max-w-prose text-sm text-muted">
          The checklist is a separate Next.js app (grupchat-chat). This host
          forwards /chat to it, so both appear as one site.
        </p>
      </main>
    </div>
  );
}