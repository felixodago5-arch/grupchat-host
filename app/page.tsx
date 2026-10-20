export default function Home() {
  return (
    <div className="min-h-screen bg-page p-3 text-ink antialiased sm:p-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-panel p-5 shadow-md sm:p-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <span className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-base font-bold text-white"
            >
              G
            </span>
            GrupChat
          </span>

          <nav aria-label="Main">
            <a
              href="/"
              aria-current="page"
              className="rounded-full bg-band px-6 py-2.5 text-sm font-medium text-white"
            >
              Plans
            </a>
          </nav>
        </header>

        {/* Intro */}
        <div className="mt-10">
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Your plans, organised in one place
          </h1>
          <p className="mt-4 max-w-prose text-lg text-muted">
            Keep track of what still needs doing for every group plan.
          </p>
        </div>

        {/* Card grid, like the course cards */}
        <section
          aria-labelledby="plan-heading"
          className="mt-10 grid gap-4 md:grid-cols-3"
        >
          {/* Big featured card */}
          <article className="relative overflow-hidden rounded-3xl bg-brand p-7 text-white sm:p-9 md:col-span-2 md:min-h-[20rem]">
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-semibold text-white/90">
                Group plan
              </p>
              <h2
                id="plan-heading"
                className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
              >
                Diani, Easter weekend
              </h2>

              <a
                href="/chat"
                className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-dark transition-colors hover:bg-sun-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Open checklist
              </a>
            </div>

            {/* Decorative shapes made with CSS, no images needed */}
            <div
              aria-hidden="true"
              className="absolute -bottom-6 right-2 hidden h-64 w-64 sm:block"
            >
              <div className="absolute right-20 top-2 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffd48a,#ff8a00)] shadow-lg" />
              <div className="absolute right-8 top-0 h-7 w-7 rounded-full bg-white shadow-md" />
              <div className="absolute bottom-14 right-14 grid h-28 w-28 rotate-6 place-items-center rounded-3xl bg-azure shadow-xl">
                <div className="grid h-16 w-16 -rotate-6 place-items-center rounded-2xl bg-pink text-3xl font-extrabold text-azure">
                  G
                </div>
              </div>
              <div className="absolute bottom-10 right-0 h-16 w-60 -rotate-12 rounded-full border-[10px] border-white/95" />
            </div>
          </article>

          {/* Side cards */}
          <div className="grid gap-4">
            <article className="rounded-3xl bg-lilac p-6">
              <p className="text-sm font-semibold text-lilac-ink">
                Who&apos;s going
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-lilac-ink">
                6 going
              </p>
              <div aria-hidden="true" className="mt-4 flex -space-x-2">
                <span className="h-9 w-9 rounded-full border-2 border-lilac bg-pink" />
                <span className="h-9 w-9 rounded-full border-2 border-lilac bg-azure" />
                <span className="h-9 w-9 rounded-full border-2 border-lilac bg-orange" />
                <span className="h-9 w-9 rounded-full border-2 border-lilac bg-lilac-strong" />
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-lilac bg-white text-xs font-bold text-lilac-ink">
                  +2
                </span>
              </div>
            </article>

            <article className="rounded-3xl bg-butter p-6">
              <p className="text-sm font-semibold text-sun">Closes in</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-sun">
                9 days
              </p>
              <p className="mt-4 text-sm text-sun/80">
                Get your tasks done before then.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
    </div>
  );
}
