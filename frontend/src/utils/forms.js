export const DEFAULT_CLOSE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function formatDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function toLocalInput(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function getFormStatus(form, now = Date.now()) {
  if (!form) return 'Closed';
  const openAt = form.openAt ? new Date(form.openAt).getTime() : null;
  const closeAt = form.closeAt ? new Date(form.closeAt).getTime() : null;
  if (openAt == null && closeAt == null) return 'Closed';
  if (closeAt != null && !Number.isNaN(closeAt) && now > closeAt) return 'Closed';
  if (openAt != null && !Number.isNaN(openAt) && now < openAt) return 'Scheduled';
  if (closeAt != null && !Number.isNaN(closeAt)) return 'Live';
  return form.isOpen ? 'Live' : 'Closed';
}

// Mirrors backend FormSubmissionsService.submit guard:
// available only when a window is set (!openAt || now >= openAt) and (!closeAt || now <= closeAt).
export function isFormAcceptingResponses(form, now = Date.now()) {
  if (!form) return false;
  const openAt = form.openAt ? new Date(form.openAt).getTime() : null;
  const closeAt = form.closeAt ? new Date(form.closeAt).getTime() : null;
  if (openAt == null && closeAt == null) return false;
  if (openAt != null && !Number.isNaN(openAt) && now < openAt) return false;
  if (closeAt != null && !Number.isNaN(closeAt) && now > closeAt) return false;
  return true;
}

export function getNextStatusTime(form, now = Date.now()) {
  if (!form) return null;
  const times = [form.openAt, form.closeAt]
    .map((value) => (value ? new Date(value).getTime() : NaN))
    .filter((t) => !Number.isNaN(t) && t > now);
  return times.length ? Math.min(...times) : null;
}

export function getNextFormsStatusTime(forms, now = Date.now()) {
  const times = (Array.isArray(forms) ? forms : [])
    .map((form) => getNextStatusTime(form, now))
    .filter((t) => t != null);
  return times.length ? Math.min(...times) : null;
}