/**
 * Calendar utilities for generating Google Calendar links and downloading .ics files
 */

/**
 * Format Date or ISO string into UTC string for calendar URLs/ICS: YYYYMMDDTHHmmssZ
 */
function formatUtcTimestamp(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate a Google Calendar pre-filled event URL
 */
export function generateGoogleCalendarUrl({ title, description, location, startTime, endTime }) {
  const startUtc = formatUtcTimestamp(startTime);
  const endUtc = formatUtcTimestamp(endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Job Interview',
    dates: `${startUtc}/${endUtc}`,
    details: description || '',
    location: location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate and trigger download of an RFC 5545 compliant .ics file
 */
export function downloadIcsFile({
  title,
  description,
  location,
  startTime,
  endTime,
  filename = 'interview-invitation.ics',
}) {
  const startUtc = formatUtcTimestamp(startTime);
  const endUtc = formatUtcTimestamp(endTime);
  const nowUtc = formatUtcTimestamp(new Date());

  const cleanDescription = (description || '')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanTitle = (title || 'Job Interview')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanLocation = (location || '')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HiORing//Candidate Interview Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@hioring.site`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanTitle}`,
    cleanDescription ? `DESCRIPTION:${cleanDescription}` : null,
    cleanLocation ? `LOCATION:${cleanLocation}` : null,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
