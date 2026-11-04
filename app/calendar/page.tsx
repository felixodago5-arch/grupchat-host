import Link from "next/link";
import CalendarView from "./calendar-view";

const NAV_LINKS = [
  { href: "/", label: "Plans", active: false },
  { href: "/calendar", label: "Calendar", active: true },
  { href: "/chat", label: "Chat", active: false },
];

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="GrupChat home">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white"
          >
            G
          </span>
          <span className="text-lg font-semibold">GrupChat</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink"
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
        <CalendarView />
      </main>
    </div>
  );
}