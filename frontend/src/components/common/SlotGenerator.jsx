import { useMemo, useState } from 'react';

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const inputBase =
  'mt-2 w-full rounded-xl border border-plum/10 bg-white px-4 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal focus:ring-2 focus:ring-teal/20';

const toMinutes = (value) => {
  const [hh, mm] = value.split(':').map(Number);
  return hh * 60 + mm;
};

const toHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const fmtMin = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
};

export function SlotGeneratorForm({ formTitle, onCreated }) {
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [slotDuration, setSlotDuration] = useState('30');
  const [breakTime, setBreakTime] = useState('0');
  const [slotCount, setSlotCount] = useState('5');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const generation = useMemo(() => {
    if (!date || !start || !end) return { slots: [], fits: false, max: 0 };
    const duration = Number(slotDuration);
    const gap = Number(breakTime);
    const count = Number(slotCount);
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (
      endMin <= startMin ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Number.isFinite(gap) ||
      gap < 0 ||
      !Number.isFinite(count) ||
      count < 1
    ) {
      return { slots: [], fits: false, max: 0 };
    }
    const step = duration + gap;
    const max = Math.floor((endMin - startMin + gap) / step);
    const slots = [];
    for (let i = 0; i < count; i += 1) {
      const slotStart = startMin + i * step;
      const slotEnd = slotStart + duration;
      if (slotEnd > endMin) break;
      slots.push({ start: slotStart, end: slotEnd });
    }
    return { slots, fits: slots.length === count, max };
  }, [date, start, end, slotDuration, breakTime, slotCount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!date) {
      setError('Pick a date for the interview slots.');
      return;
    }
    if (!start || !end) {
      setError('Set the interview window start and end time.');
      return;
    }
    const duration = Number(slotDuration);
    const gap = Number(breakTime);
    const count = Number(slotCount);
    if (!Number.isFinite(duration) || duration <= 0) {
      setError('Slot duration must be at least 1 minute.');
      return;
    }
    if (!Number.isFinite(gap) || gap < 0) {
      setError('Break between slots cannot be negative.');
      return;
    }
    if (!Number.isFinite(count) || count < 1) {
      setError('Enter how many slots you want to create.');
      return;
    }
    if (toMinutes(end) <= toMinutes(start)) {
      setError('End time must be after the start time.');
      return;
    }
    if (!generation.fits || generation.slots.length === 0) {
      setError(
        generation.max < 1
          ? 'No interview slots fit between your start and end time.'
          : `Only ${generation.max} slot${generation.max === 1 ? '' : 's'} fit in this window — reduce the count, shorten the duration, or extend the end time.`
      );
      return;
    }
    setError('');
    setSaving(true);
    try {
      const slots = generation.slots.map((s) => ({
        startTime: new Date(`${date}T${toHHMM(s.start)}`).toISOString(),
        endTime: new Date(`${date}T${toHHMM(s.end)}`).toISOString(),
        meetingLink: link.trim() || undefined,
      }));
      await onCreated(slots);
      setSaving(false);
    } catch (err) {
      setError(err?.message || 'Failed to create interview slots. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formTitle && (
        <p className="rounded-lg bg-plum/5 px-3 py-2 text-xs font-semibold text-plum">
          Creating slots for <span className="font-bold">{formTitle}</span>
        </p>
      )}

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-plum">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className={`${inputBase} h-12`}
        />
      </label>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-plum">Window start</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={`${inputBase} h-12`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-plum">Window end</span>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={`${inputBase} h-12`}
          />
        </label>
      </div>

      <div className="mt-6">
        <span className="text-xs font-bold uppercase tracking-wider text-plum">Slot generator</span>
        <p className="mt-1 text-xs text-stone-500">
          Split the window into evenly spaced slots so each candidate gets their own time.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Duration (min)</span>
            <input
              type="number"
              min="1"
              max="240"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className={`${inputBase} h-11`}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Break (min)</span>
            <input
              type="number"
              min="0"
              max="120"
              value={breakTime}
              onChange={(e) => setBreakTime(e.target.value)}
              className={`${inputBase} h-11`}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Slots</span>
            <input
              type="number"
              min="1"
              max="50"
              value={slotCount}
              onChange={(e) => setSlotCount(e.target.value)}
              className={`${inputBase} h-11`}
            />
          </label>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-bold uppercase tracking-wider text-plum">
          Meeting link <span className="font-medium normal-case text-stone-400">(Optional)</span>
        </span>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://meet.google.com/abc-defg-hij"
          className={`${inputBase} h-12`}
        />
        <span className="mt-1.5 block text-[11px] text-stone-400">Applied to every generated slot.</span>
      </label>

      {generation.slots.length > 0 && (
        <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-plum/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#344e41]">Generated preview</span>
            {generation.fits ? (
              <span className="text-[11px] font-semibold text-teal">
                {generation.slots.length} × {slotDuration} min
                {Number(breakTime) > 0 ? ` · ${breakTime} min break` : ''}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-600">Adjust to fit</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {generation.slots.map((s) => (
              <span
                key={`${s.start}-${s.end}`}
                className="rounded-lg bg-plum/5 px-2.5 py-1 text-xs font-semibold text-plum ring-1 ring-plum/10"
              >
                {fmtMin(s.start)} – {fmtMin(s.end)}
              </span>
            ))}
          </div>
          {!generation.fits && (
            <p className="mt-3 rounded-lg bg-gold/25 px-3 py-2 text-xs font-semibold text-plum">
              Only {generation.slots.length} of {slotCount} requested slots fit in this window —
              reduce the count, shorten the duration, or extend the end time.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating…
            </>
          ) : (
            <>
              <PlusIcon />
              Create{' '}
              {generation.fits && generation.slots.length > 0
                ? `${generation.slots.length} slot${generation.slots.length === 1 ? '' : 's'}`
                : 'slots'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function SlotGeneratorModal({ formTitle, onClose, onCreated }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add interview slots"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-plum-dark/50 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[20px] bg-[#f2efe7] p-7 shadow-2xl ring-1 ring-plum/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-plum">Add interview slots</h3>
            <p className="mt-1 truncate text-sm text-stone-500">{formTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-500 ring-1 ring-plum/10 transition hover:bg-plum hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <SlotGeneratorForm formTitle={formTitle} onCreated={onCreated} />
        </div>
      </div>
    </div>
  );
}