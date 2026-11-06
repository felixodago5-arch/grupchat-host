"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  description: string;
};

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
};

type FormState = {
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
};

type FormErrors = Partial<Record<"title" | "date" | "start" | "end", string>>;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-brand";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function keyToDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function convertGoogleEvent(event: GoogleCalendarEvent, index: number): CalendarEvent | null {
  if (!event.start?.date && !event.start?.dateTime) return null;

  let date: string;
  let start: string;
  let end: string;

  if (event.start.date) {
    date = event.start.date;
    start = "00:00";
    end = "23:59";
  } else {
    const startDate = new Date(event.start.dateTime!);
    if (Number.isNaN(startDate.getTime())) return null;

    date = toKey(startDate);
    start = formatTime(startDate);

    if (event.end?.dateTime) {
      const endDate = new Date(event.end.dateTime);
      end = Number.isNaN(endDate.getTime()) ? start : formatTime(endDate);
    } else {
      end = start;
    }
  }

  return {
    id: event.id || `google-event-${index}`,
    title: event.summary?.trim() || "Untitled event",
    date,
    start,
    end,
    description: event.description?.trim() || "",
  };
}

const emptyForm = (date: string): FormState => ({
  title: "",
  date,
  start: "",
  end: "",
  description: "",
});

export default function CalendarView() {
  // Date-dependent state is set after mount to avoid server/client mismatches.
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(""));
  const [errors, setErrors] = useState<FormErrors>({});
  const [savingEvent, setSavingEvent] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const now = new Date();
    setTodayKey(toKey(now));
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }, []);

  async function fetchEvents() {
    setLoadingEvents(true);
    setEventsError(null);

    try {
      const response = await fetch("/api/google/events", {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data.error === "string"
            ? data.error
            : "Could not load Google Calendar events.";
        throw new Error(message);
      }

      if (!data || !Array.isArray(data.events)) {
        throw new Error("Google Calendar returned an unexpected response.");
      }

      const converted = data.events
        .map((event: GoogleCalendarEvent, index: number) =>
          convertGoogleEvent(event, index)
        )
        .filter((event: CalendarEvent | null): event is CalendarEvent => event !== null);
      setEvents(converted);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load Google Calendar events.";
      setEventsError(message);
      setEvents([]);
      return false;
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Native <dialog> gives Esc-to-close and focus trapping.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      map.set(e.date, [...(map.get(e.date) ?? []), e]);
    }
    for (const list of map.values()) list.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    if (!todayKey) return [];
    return events
      .filter((e) => e.date >= todayKey)
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      .slice(0, 5);
  }, [events, todayKey]);

  function shiftMonth(delta: number) {
    setView((v) => {
      if (!v) return v;
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function openModal() {
    setForm(emptyForm(todayKey ?? ""));
    setErrors({});
    setSaveError(null);
    setOpen(true);
  }

  function validate(f: FormState): FormErrors {
    const next: FormErrors = {};
    if (!f.title.trim()) next.title = "Enter an event title.";
    if (!f.date) next.date = "Choose a date.";
    if (!f.start) next.start = "Choose a start time.";
    if (!f.end) next.end = "Choose an end time.";
    if (f.start && f.end && f.end <= f.start) next.end = "End time must be after the start time.";
    return next;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (savingEvent) return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSavingEvent(true);
    setSaveError(null);

    const startDateTime = `${form.date}T${form.start}:00+03:00`;
    const endDateTime = `${form.date}T${form.end}:00+03:00`;

    try {
      const response = await fetch("/api/google/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: form.title.trim(),
          description: form.description.trim(),
          start: {
            dateTime: startDateTime,
            timeZone: "Africa/Nairobi",
          },
          end: {
            dateTime: endDateTime,
            timeZone: "Africa/Nairobi",
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data.error === "string"
            ? data.error
            : "Could not create the calendar event.";
        throw new Error(message);
      }

      await fetchEvents();

      const saved = keyToDate(form.date);
      setView({ year: saved.getFullYear(), month: saved.getMonth() });
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create the calendar event.";
      setSaveError(message);
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (!eventId || deletingEventId !== null) return;

    setDeletingEventId(eventId);
    setDeleteError(null);

    try {
      const response = await fetch("/api/google/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data.error === "string"
            ? data.error
            : "Could not delete the calendar event.";
        throw new Error(message);
      }

      await fetchEvents();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete the calendar event.";
      setDeleteError(message);
    } finally {
      setDeletingEventId(null);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // --- Grid -----------------------------------------------------------------
  const cells = useMemo(() => {
    if (!view) return [];
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => new Date(view.year, view.month, 1 - offset + i));
  }, [view]);

  const monthLabel = view
    ? new Date(view.year, view.month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  return (
    <>
      <section className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Calendar</h1>
          <p className="mt-2 max-w-xl text-muted">
            Organise your group events in one place. Add an event and everyone can see what&apos;s coming up.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={!todayKey}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
        >
          + New event
        </button>
      </section>

      {loadingEvents && (
        <p role="status" className="mb-4 rounded-2xl border border-ink/10 bg-panel px-4 py-3 text-sm text-muted">
          Loading Google Calendar events...
        </p>
      )}
      {eventsError && !loadingEvents && (
        <p role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {eventsError}
        </p>
      )}

      <section aria-labelledby="month-label" className="rounded-3xl border border-ink/10 bg-panel p-3 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="month-label" aria-live="polite" className="text-xl font-semibold">
            {monthLabel || "\u00A0"}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white hover:bg-page focus-visible:outline-2 focus-visible:outline-brand"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white hover:bg-page focus-visible:outline-2 focus-visible:outline-brand"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-band/10 py-2 text-center text-xs font-medium text-muted sm:text-sm">
              {d}
            </div>
          ))}

          {cells.map((date) => {
            const key = toKey(date);
            const inMonth = view !== null && date.getMonth() === view.month;
            const isToday = key === todayKey;
            const dayEvents = eventsByDate.get(key) ?? [];
            return (
              <div
                key={key}
                className={`flex min-h-16 min-w-0 flex-col gap-1 p-1 sm:min-h-28 sm:p-2 ${
                  inMonth ? "bg-white" : "bg-page/70 text-muted"
                }`}
              >
                <time
                  dateTime={key}
                  aria-current={isToday ? "date" : undefined}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs sm:h-7 sm:w-7 sm:text-sm ${
                    isToday ? "bg-brand font-semibold text-white" : inMonth ? "font-medium" : "opacity-60"
                  }`}
                >
                  {date.getDate()}
                </time>

                {/* Mobile: dots only. Desktop: titled chips. */}
                <div className="flex flex-wrap gap-0.5 sm:hidden">
                  {dayEvents.map((e) => (
                    <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-brand" title={e.title} />
                  ))}
                </div>
                <ul className="hidden min-w-0 flex-col gap-1 sm:flex">
                  {dayEvents.slice(0, 2).map((e) => (
                    <li
                      key={e.id}
                      title={`${e.start} ${e.title}`}
                      className="truncate rounded-md bg-brand/10 px-1.5 py-0.5 text-xs text-brand"
                    >
                      {e.title}
                    </li>
                  ))}
                  {dayEvents.length > 2 && (
                    <li className="px-1 text-xs text-muted">+{dayEvents.length - 2} more</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="upcoming-heading" className="mt-6 rounded-3xl border border-ink/10 bg-panel p-4 sm:p-6">
        <h2 id="upcoming-heading" className="text-xl font-semibold">
          Upcoming events
        </h2>
        {deleteError && (
          <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {deleteError}
          </p>
        )}
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No upcoming events. Use &ldquo;+ New event&rdquo; to add one.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {upcoming.map((e) => (
              <li key={e.id} className="flex flex-col gap-1 rounded-2xl border border-ink/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="break-words">{e.title}</span>
                  </p>
                  {e.description && <p className="break-words text-sm text-muted">{e.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:ml-3">
                  <p className="text-sm text-muted">
                    {keyToDate(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    {" · "}
                    {e.start}–{e.end}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingEventId !== null}
                    aria-label={`Delete ${e.title}`}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingEventId === e.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="new-event-title"
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          if (savingEvent) event.preventDefault();
        }}
        onClick={(e) => {
          if (savingEvent) return;
          if (e.target === e.currentTarget) setOpen(false); // backdrop click
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-panel p-0 text-ink backdrop:bg-ink/40"
      >
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 id="new-event-title" className="text-xl font-semibold">
            New event
          </h2>

          <div>
            <label htmlFor="event-title" className="mb-1 block text-sm font-medium">
              Event title
            </label>
            <input
              id="event-title"
              type="text"
              autoFocus
              disabled={savingEvent}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "event-title-error" : undefined}
              className={inputClass}
            />
            {errors.title && (
              <p id="event-title-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="event-date" className="mb-1 block text-sm font-medium">
              Date
            </label>
            <input
              id="event-date"
              type="date"
              disabled={savingEvent}
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "event-date-error" : undefined}
              className={inputClass}
            />
            {errors.date && (
              <p id="event-date-error" role="alert" className="mt-1 text-sm text-red-600">
                {errors.date}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start" className="mb-1 block text-sm font-medium">
                Start time
              </label>
              <input
                id="event-start"
                type="time"
                disabled={savingEvent}
                value={form.start}
                onChange={(e) => setField("start", e.target.value)}
                aria-invalid={!!errors.start}
                aria-describedby={errors.start ? "event-start-error" : undefined}
                className={inputClass}
              />
              {errors.start && (
                <p id="event-start-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.start}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="event-end" className="mb-1 block text-sm font-medium">
                End time
              </label>
              <input
                id="event-end"
                type="time"
                disabled={savingEvent}
                value={form.end}
                onChange={(e) => setField("end", e.target.value)}
                aria-invalid={!!errors.end}
                aria-describedby={errors.end ? "event-end-error" : undefined}
                className={inputClass}
              />
              {errors.end && (
                <p id="event-end-error" role="alert" className="mt-1 text-sm text-red-600">
                  {errors.end}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="event-description" className="mb-1 block text-sm font-medium">
              Description <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="event-description"
              rows={3}
              disabled={savingEvent}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputClass}
            />
          </div>

          {saveError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={savingEvent}
              onClick={() => setOpen(false)}
              className="rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-medium hover:bg-page focus-visible:outline-2 focus-visible:outline-brand"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEvent}
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {savingEvent ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}