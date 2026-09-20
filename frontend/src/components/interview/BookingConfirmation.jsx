import { formatDateHeader, formatTime12h } from '../../utils/timeslot';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';

/**
 * Format ISO datetime into full local date string
 */
function toFullDateString(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Helper to format ISO string to local 12h time (e.g. "09:30 AM")
 */
function toLocalTime12h(isoString) {
  const d = new Date(isoString);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return formatTime12h(`${h}:${m}`);
}

/**
 * Calculate duration in minutes between two ISO date strings
 */
function getDurationMinutes(startIso, endIso) {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

export default function BookingConfirmation({ booking, form }) {
  if (!booking) return null;

  const jobTitle = form?.title || 'Job Interview';
  const jobDescription = form?.description || `Interview for ${jobTitle}`;
  const startTimeStr = toLocalTime12h(booking.startTime);
  const endTimeStr = toLocalTime12h(booking.endTime);
  const fullDateStr = toFullDateString(booking.startTime);
  const durationMins = getDurationMinutes(booking.startTime, booking.endTime);
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const googleCalUrl = generateGoogleCalendarUrl({
    title: `Interview: ${jobTitle}`,
    description: jobDescription,
    location: booking.meetingLink || 'Office / Online (Link will be provided)',
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  const handleDownloadIcs = () => {
    downloadIcsFile({
      title: `Interview: ${jobTitle}`,
      description: jobDescription,
      location: booking.meetingLink || 'Office / Online',
      startTime: booking.startTime,
      endTime: booking.endTime,
      filename: `interview-${(form?.title || 'booking').toLowerCase().replace(/\s+/g, '-')}.ics`,
    });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl ring-1 ring-plum/5">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-plum to-plum-dark px-6 py-8 text-center text-white sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">
          Interview Confirmed!
        </h2>
        <p className="mt-2 text-sm text-white/80 sm:text-base">
          Your interview for <span className="font-semibold text-white">{jobTitle}</span> has been successfully scheduled.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="space-y-6 p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Date & Time */}
          <div className="rounded-2xl border border-stone-100 bg-[#fbf9f4] p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Date & Time
            </span>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plum/10 text-plum">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-plum">{fullDateStr}</div>
                <div className="text-sm font-semibold text-stone-700">
                  {startTimeStr} – {endTimeStr} ({durationMins} minutes)
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  Timezone: <span className="font-medium text-stone-700">{localTimezone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location / Meeting Link */}
          <div className="rounded-2xl border border-stone-100 bg-[#fbf9f4] p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Meeting Location / Format
            </span>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plum/10 text-plum">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-plum">
                  {booking.meetingLink ? 'Online Video Meeting' : 'Interview Session'}
                </div>
                {booking.meetingLink ? (
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-plum underline transition hover:text-plum-dark"
                  >
                    <span>Join Meeting Room</span>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-stone-600">
                    Meeting details and link will be provided by your recruiter.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Quick Actions */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Add to Your Calendar
          </span>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm transition hover:border-plum hover:bg-stone-50 active:scale-[0.99]"
            >
              <svg className="h-4 w-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
              <span>Add to Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm transition hover:border-plum hover:bg-stone-50 active:scale-[0.99]"
            >
              <svg className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download iCal (.ics)</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="leading-relaxed">
              Please check your inbox for any additional instructions. If you need to make changes or have questions about the interview, please reach out to the hiring team directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
