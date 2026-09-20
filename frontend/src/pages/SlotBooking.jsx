import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getForm,
  getInterviewBooking,
  listAvailableInterviewSlots,
  bookInterviewSlot,
} from '../services/api';

const fmtDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const fmtTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const toCalendarStamp = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

const buildGoogleCalendarUrl = (booking, form) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: form?.title ? `Interview – ${form.title}` : 'Interview',
    dates: `${toCalendarStamp(booking.startTime)}/${toCalendarStamp(booking.endTime)}`,
  });
  if (booking.meetingLink) {
    params.set('location', booking.meetingLink);
    params.set('details', `Join: ${booking.meetingLink}`);
  } else {
    params.set('details', 'Interview scheduled via HiOring.');
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SlotBooking() {
  const { formId, submissionId } = useParams();
  const [form, setForm] = useState(null);
  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [bookError, setBookError] = useState('');

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const groupedSlots = useMemo(() => {
    const map = new Map();
    const groups = [];
    slots.forEach((slot) => {
      const key = new Date(slot.startTime).toDateString();
      if (!map.has(key)) {
        const group = { key, date: slot.startTime, slots: [] };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key).slots.push(slot);
    });
    return groups;
  }, [slots]);

  useEffect(() => {
    if (!formId || !submissionId) return;

    let cancelled = false;

    (async () => {
      getForm(formId)
        .then((data) => {
          if (!cancelled) setForm(data);
        })
        .catch(() => {});

      try {
        const existing = await getInterviewBooking(submissionId);
        if (cancelled) return;
        setBooking(existing);
        setLoading(false);
        return;
      } catch (err) {
        if (cancelled) return;
        if (err?.status !== 404) {
          setError(err?.message || 'Could not load your interview details.');
          setLoading(false);
          return;
        }
      }

      try {
        const available = await listAvailableInterviewSlots(formId);
        if (cancelled) return;
        setSlots(available || []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load available interview times.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formId, submissionId]);

  const handleBook = async (slotId) => {
    setBookError('');
    setBookingId(slotId);
    try {
      const booked = await bookInterviewSlot(submissionId, slotId);
      setBooking(booked);
    } catch (err) {
      if (err?.status === 400) {
        try {
          const existing = await getInterviewBooking(submissionId);
          setBooking(existing);
          return;
        } catch {}
      }
      setBookError(err?.message || 'Could not book this slot. Please try again.');
      if (err?.status === 409) {
        try {
          setSlots(await listAvailableInterviewSlots(formId));
        } catch {}
      }
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f2efe7] font-sans text-stone-800 antialiased">
      <header className="sticky top-0 z-50 border-b border-plum/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-teal">
              <span className="font-serif text-xl font-bold text-white">H</span>
              <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-gold" />
            </span>
            <span className="text-xl font-bold tracking-tight text-plum">HiOring</span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Interview scheduling
          </span>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:px-8">
          {loading ? (
            <div className="space-y-3">
              <div className="h-7 w-2/3 animate-pulse rounded-full bg-white/70" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/60" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-[20px] bg-white/60 p-5 ring-1 ring-plum/10"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded-full bg-plum/10" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-plum/10" />
                  </div>
                  <div className="h-10 w-32 animate-pulse rounded-full bg-plum/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
              <div className="rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <CalendarIcon />
                </span>
                <p className="mt-4 text-xl font-bold text-plum">Something went wrong</p>
                <p className="mt-2 text-sm text-stone-600">{error}</p>
              </div>
            </div>
          ) : booking ? (
            <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
              <div className="rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal">
                  <CheckIcon />
                </span>
                <p className="mt-4 text-xl font-bold text-plum">Interview time confirmed</p>
                <p className="mt-2 text-sm text-stone-600">
                  {form?.title ? `You're booked for ${form.title} on ` : 'You have booked '}
                  <strong>{fmtDate(booking.startTime)}</strong> at{' '}
                  <strong>{fmtTime(booking.startTime)}</strong>
                  {' – '}
                  <strong>{fmtTime(booking.endTime)}</strong>.
                </p>
                {booking.meetingLink && (
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:bg-plum-dark"
                  >
                    Join meeting
                  </a>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={buildGoogleCalendarUrl(booking, form)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-plum/20 px-5 py-2.5 text-sm font-bold text-plum transition hover:bg-plum hover:text-white"
                  >
                    Add to Google Calendar
                  </a>
                </div>
                <p className="mt-6 text-xs text-stone-400">
                  Keep this link handy — you can revisit it anytime to view your interview details.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
              <p className="text-xl font-bold tracking-tight text-plum">
                {form?.title ? `Schedule your interview for ${form.title}` : 'Schedule your interview'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Great news — your application has moved forward. Pick a time below that works best
                for you.
              </p>
              <p className="mt-2 text-xs font-semibold text-stone-400">
                All times shown in {timezone}.
              </p>

              {bookError && (
                <div className="mt-5 rounded-[16px] bg-red-100 px-5 py-4 text-sm font-semibold text-red-600">
                  {bookError}
                </div>
              )}

              {slots.length === 0 ? (
                <div className="mt-6 rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <ClockIcon />
                  </span>
                  <p className="mt-4 text-base font-bold text-plum">No times available</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                    There are no open interview times right now. Please check back later or contact
                    the hiring team.
                  </p>
                </div>
              ) : (
                <ul className="mt-6 space-y-6">
                  {groupedSlots.map((group) => (
                    <li key={group.key}>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
                        {fmtDate(group.date)}
                      </p>
                      <ul className="space-y-3">
                        {group.slots.map((slot) => {
                          const pending = bookingId === slot.id;
                          return (
                            <li
                              key={slot.id}
                              className="rounded-[20px] bg-white/70 p-5 ring-1 ring-plum/10 transition hover:shadow-md"
                            >
                              <div className="flex w-full items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="font-semibold text-plum">{fmtDate(slot.startTime)}</p>
                                  <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                                    <ClockIcon />
                                    {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleBook(slot.id)}
                                  disabled={bookingId !== null}
                                  className="flex shrink-0 items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-bold text-white transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {pending ? 'Booking...' : 'Book this time'}
                                  {!pending && <ChevronIcon />}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SlotBooking;