/**
 * Timeslot calculation and formatting helpers
 */

/**
 * Parse HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert minutes from midnight to HH:mm (24h)
 */
export function minutesToTime(mins) {
  const normalized = Math.max(0, mins) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format HH:mm string to 12-hour AM/PM format (e.g. "09:00 AM")
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Format YYYY-MM-DD to human friendly header, e.g. "Thu, Sep 17, 2026"
 */
export function formatDateHeader(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Create an ISO string combining date YYYY-MM-DD and time HH:mm
 */
export function toSlotIso(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return d.toISOString();
}

/**
 * Compute batch calculation stats based on start, end, duration, buffer
 */
export function computeBatchStats(startTime, endTime, duration, buffer) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const totalMins = endMins - startMins;

  if (totalMins <= 0) {
    return {
      valid: false,
      error: 'End time must be after start time.',
      totalMins: 0,
      totalHoursStr: '0h',
      slotCount: 0,
      slots: [],
    };
  }

  if (totalMins < duration) {
    return {
      valid: false,
      error: `Range (${totalMins}m) is shorter than meeting duration (${duration}m).`,
      totalMins,
      totalHoursStr: formatMinutesToHours(totalMins),
      slotCount: 0,
      slots: [],
    };
  }

  const interval = duration + buffer;
  const count = Math.floor((totalMins - duration) / interval) + 1;
  const calculatedCount = Math.max(0, count);

  // Generate individual slot boundaries
  const slots = [];
  let currentStart = startMins;
  while (currentStart + duration <= endMins) {
    const currentEnd = currentStart + duration;
    slots.push({
      startTime: minutesToTime(currentStart),
      endTime: minutesToTime(currentEnd),
    });
    currentStart = currentEnd + buffer;
  }

  return {
    valid: true,
    error: null,
    totalMins,
    totalHoursStr: formatMinutesToHours(totalMins),
    slotCount: slots.length,
    slots,
  };
}

/**
 * Format minutes into clean hours/minutes string e.g. "3h range" or "2h 30m range"
 */
export function formatMinutesToHours(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m range`;
  if (h > 0) return `${h}h range`;
  return `${m}m range`;
}
