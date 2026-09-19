import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  computeBatchStats,
  formatDateHeader,
  formatTime12h,
  toSlotIso,
} from '../../utils/timeslot';
import {
  listInterviewSlots,
  createInterviewSlots,
  deleteInterviewSlot,
  clearInterviewSlots,
} from '../../services/api';
import { toast } from 'sonner';


const DURATION_OPTIONS = [15, 30, 45, 60];

const BUFFER_OPTIONS = [
  { value: 0, label: 'No break between interviews' },
  { value: 5, label: '5 mins break' },
  { value: 10, label: '10 mins break' },
  { value: 15, label: '15 mins break' },
];

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getShiftedDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Map backend slots into UI items
function mapBackendSlots(backendSlots) {
  if (!Array.isArray(backendSlots)) return [];
  return backendSlots.map((bs) => {
    const startD = new Date(bs.startTime);
    const endD = new Date(bs.endTime);
    const y = startD.getFullYear();
    const m = String(startD.getMonth() + 1).padStart(2, '0');
    const d = String(startD.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const sTime = `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`;
    const eTime = `${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`;
    const dur = Math.round((endD.getTime() - startD.getTime()) / 60000);

    return {
      id: `backend-${bs.id}`,
      backendId: bs.id,
      formId: bs.formId,
      date: dateStr,
      startTime: sTime,
      endTime: eTime,
      duration: dur,
      buffer: 0,
      selected: true,
      status: bs.status || 'AVAILABLE',
      meetingLink: bs.meetingLink || '',
      candidateEmail: bs.submission?.email || null,
    };
  });
}

function ClearAllSlotsModal({ open, slotCount, totalCount, isClearing, onClose, onConfirm }) {
  const [isReady, setIsReady] = useState(false);
  const [progressStarted, setProgressStarted] = useState(false);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setIsReady(false);
      setProgressStarted(false);
      return;
    }
    setIsReady(false);
    setProgressStarted(false);

    let tStart;
    let tDone;

    const raf = requestAnimationFrame(() => {
      tStart = setTimeout(() => {
        setProgressStarted(true);
      }, 50);

      tDone = setTimeout(() => {
        setIsReady(true);
      }, 3050);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (tStart) clearTimeout(tStart);
      if (tDone) clearTimeout(tDone);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-[auth-backdrop-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-all-modal-title"
      onClick={isClearing ? undefined : onClose}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl ring-1 ring-plum/10 animate-[auth-card-in_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </span>
          <div>
            <h3 id="clear-all-modal-title" className="font-sans text-lg font-bold text-[#344e41]">
              Clear all timeslots?
            </h3>
            <p className="text-xs text-stone-500">
              This cannot be undone.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Are you sure you want to clear all{' '}
          <strong className="font-semibold text-red-600">{slotCount}</strong> unbooked timeslot{slotCount === 1 ? '' : 's'} from this role?
          {totalCount > slotCount && (
            <span className="mt-1.5 block text-xs font-medium text-amber-700">
              Note: {totalCount - slotCount} booked timeslot{totalCount - slotCount === 1 ? '' : 's'} will be preserved.
            </span>
          )}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="h-10 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Slider Progress Fill Button (transforms to red from left to right) */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isReady || isClearing}
            className={`relative h-10 w-full sm:w-36 overflow-hidden rounded-full border text-sm font-semibold transition-all select-none ${
              isClearing
                ? 'cursor-wait border-red-700 bg-red-700 text-white'
                : isReady
                ? 'cursor-pointer border-red-600 bg-red-600 text-white shadow-md hover:bg-red-700 active:scale-95'
                : 'cursor-not-allowed border-red-300 bg-red-300/80 text-red-900'
            }`}
          >
            {isClearing ? (
              <span className="flex h-full w-full items-center justify-center gap-1.5 text-white">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Clearing...</span>
              </span>
            ) : (
              <>
                {/* Base Layer (Unfilled disabled red state) */}
                <span className="flex h-full w-full items-center justify-center gap-1.5 text-red-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Clear All</span>
                </span>

                {/* Sliding Color Overlay (Transforms into full red color from left to right like a slider) */}
                <span
                  className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center gap-1.5 bg-red-600 text-white transition-[clip-path] ease-linear"
                  style={{
                    clipPath: progressStarted || isReady ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                    transitionDuration: isReady ? '0ms' : '3000ms',
                  }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Clear All</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


export default function InterviewTimeslotScheduler({ formId, formTitle }) {
  // Slots & network state for this nested formId
  const [loadingBackendSlots, setLoadingBackendSlots] = useState(false);
  const [isSubmittingToBackend, setIsSubmittingToBackend] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  // Left Column Multi-Range Builder state
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);

  // Right Column Selected Slots state
  const [slots, setSlots] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);


  // Fetch existing timeslots for this nested formId
  useEffect(() => {
    if (!formId) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingBackendSlots(true);
    listInterviewSlots(formId)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setSlots(mapBackendSlots(data));
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBackendSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId]);

  // Live Batch Calculation: (End Time Mins - Start Time Mins) / (Duration + Buffer)
  const calculation = useMemo(() => {
    return computeBatchStats(startTime, endTime, duration, buffer);
  }, [startTime, endTime, duration, buffer]);

  // Calculation details & duplicate detection
  const calculationSummary = useMemo(() => {
    if (!calculation.valid) return null;

    const prospectiveSlots = calculation.slots;
    let duplicateCount = 0;
    for (const ps of prospectiveSlots) {
      const exists = slots.some(
        (s) => s.date === date && s.startTime === ps.startTime && s.endTime === ps.endTime
      );
      if (exists) duplicateCount++;
    }
    const newCount = Math.max(0, prospectiveSlots.length - duplicateCount);

    const bufferText = buffer > 0 ? ` + ${buffer}m buffer` : '';
    const formula = `${calculation.totalHoursStr} / (${duration}m${bufferText}) = ${calculation.slotCount} slots batch`;

    return {
      formula,
      slotCount: calculation.slotCount,
      newCount,
      duplicateCount,
    };
  }, [calculation, slots, date, duration, buffer]);

  // Handle Generate & Create Timeslots directly in Backend
  const handleGenerateAndCreateSlots = async () => {
    if (!calculation.valid || calculation.slots.length === 0 || !formId) return;

    // Deduplication check against existing slots for that date and time window
    const nonDuplicateSlots = [];
    let duplicateCount = 0;

    for (const s of calculation.slots) {
      const isDuplicate = slots.some(
        (existing) =>
          existing.date === date &&
          existing.startTime === s.startTime &&
          existing.endTime === s.endTime
      );

      if (isDuplicate) {
        duplicateCount++;
      } else {
        nonDuplicateSlots.push(s);
      }
    }

    if (nonDuplicateSlots.length === 0) {
      toast.warning(`All ${duplicateCount} slots in this time window already exist for ${formatDateHeader(date)}.`);
      return;
    }

    // Time validation: prevent generating slots in the past
    const now = new Date();
    const hasPastSlot = nonDuplicateSlots.some((s) => {
      const iso = toSlotIso(date, s.startTime);
      return new Date(iso) < now;
    });

    if (hasPastSlot) {
      toast.error('Cannot create interview slots in the past. Please select a future date or start time.');
      return;
    }

    setIsSubmittingToBackend(true);

    try {
      // Build ISO payload for backend: { slots: [{ startTime, endTime }] }
      const payload = nonDuplicateSlots.map((s) => ({
        startTime: toSlotIso(date, s.startTime),
        endTime: toSlotIso(date, s.endTime),
      }));

      // Directly create in backend
      const freshSlotsFromBackend = await createInterviewSlots(formId, payload);

      // Instantly update the right column list with fresh slots from the database
      setSlots(mapBackendSlots(freshSlotsFromBackend));

      toast.success(
        `Successfully created ${nonDuplicateSlots.length} timeslot${
          nonDuplicateSlots.length === 1 ? '' : 's'
        } ${
          duplicateCount > 0 ? ` (${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} skipped)` : ''
        }!`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to create interview timeslots in the backend.');
    } finally {
      setIsSubmittingToBackend(false);
    }
  };

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const groups = {};
    for (const slot of slots) {
      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }
      groups[slot.date].push(slot);
    }

    const sortedDates = Object.keys(groups).sort();
    return sortedDates.map((d) => {
      const sortedSlots = groups[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return {
        date: d,
        slots: sortedSlots,
        total: sortedSlots.length,
      };
    });
  }, [slots]);

  // Overall Stats
  const uniqueDatesCount = useMemo(() => {
    return new Set(slots.map((s) => s.date)).size;
  }, [slots]);

  // Unbooked slots count
  const unbookedSlotsCount = useMemo(() => {
    return slots.filter((s) => s.status !== 'BOOKED').length;
  }, [slots]);

  // Remove individual slot from backend and local view
  const handleDeleteSlot = async (slot) => {
    if (!slot) return;
    if (slot.status === 'BOOKED') {
      toast.warning('Booked interview timeslots cannot be deleted.');
      return;
    }

    if (slot.backendId && formId) {
      setDeletingSlotId(slot.id);
      try {
        await deleteInterviewSlot(formId, slot.backendId);
        setSlots((prev) => prev.filter((s) => s.id !== slot.id));
        toast.success('Interview timeslot deleted successfully.');
      } catch (err) {
        toast.error(err.message || 'Failed to delete interview timeslot.');
      } finally {
        setDeletingSlotId(null);
      }
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    }
  };

  // Clear all unbooked slots from backend and local view
  const handleClearAll = async () => {
    if (!formId) {
      setSlots([]);
      setShowClearConfirm(false);
      return;
    }

    setIsClearing(true);
    try {
      await clearInterviewSlots(formId);
      // Refresh slots from backend to ensure consistent state
      const freshSlots = await listInterviewSlots(formId);
      setSlots(mapBackendSlots(freshSlots));
      setShowClearConfirm(false);
      toast.success('All unbooked interview timeslots cleared successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to clear interview timeslots.');
    } finally {
      setIsClearing(false);
    }
  };


  return (
    <div className="w-full space-y-6 font-sans">
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Multi-Range Builder Form (5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5">
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10 lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:min-h-[620px]">
            <div className="shrink-0 border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold text-[#344e41]">
                Create Interview Timeslots
              </h3>
            </div>

            <div className="mt-5 flex flex-1 flex-col justify-between space-y-5 overflow-y-auto pr-1 [scrollbar-width:thin]">
              <div className="space-y-5">
                {/* 1. Interview Date Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-teal focus:ring-1 focus:ring-teal"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDate(getTodayString())}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        date === getTodayString()
                          ? 'bg-[#344e41] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getShiftedDateString(1))}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        date === getShiftedDateString(1)
                          ? 'bg-[#344e41] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getShiftedDateString(7))}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        date === getShiftedDateString(7)
                          ? 'bg-[#344e41] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      +1 Week
                    </button>
                    <span className="ml-auto text-xs font-semibold text-teal">
                      {formatDateHeader(date)}
                    </span>
                  </div>
                </div>

                {/* 2. Start & End Time Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 shadow-sm outline-none transition focus:border-teal focus:ring-1 focus:ring-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 shadow-sm outline-none transition focus:border-teal focus:ring-1 focus:ring-teal"
                    />
                  </div>
                </div>

                {/* 3. Meeting Duration Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Meeting Duration
                  </label>
                  <div className="mt-1.5 grid grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map((d) => {
                      const active = duration === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`h-10 rounded-xl text-xs font-bold transition ${
                            active
                              ? 'bg-[#344e41] text-white shadow-md ring-1 ring-[#344e41]'
                              : 'border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                          }`}
                        >
                          {d}m
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Break / Buffer Interval Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Break / Buffer Interval
                  </label>
                  <select
                    value={buffer}
                    onChange={(e) => setBuffer(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-teal focus:ring-1 focus:ring-teal"
                  >
                    {BUFFER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Buffer time between consecutive interview slots.
                  </p>
                </div>

                {/* 5. Dynamic Range Calculation Box */}
                {calculation.valid ? (
                  <div className="rounded-xl border border-teal/30 bg-teal/5 p-4 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal">Batch Preview Calculation</span>
                      <span className="rounded-full bg-teal px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                        {calculationSummary.newCount} New
                      </span>
                    </div>

                    <div className="mt-2 text-sm font-bold text-[#344e41]">
                      {calculationSummary.formula}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span>
                        Total time: <strong className="text-stone-700">{calculation.totalMins} mins</strong>
                      </span>
                      <span>
                        Duration: <strong className="text-stone-700">{duration}m</strong>
                      </span>
                      {buffer > 0 && (
                        <span>
                          Buffer: <strong className="text-stone-700">{buffer}m</strong>
                        </span>
                      )}
                      {calculationSummary.duplicateCount > 0 && (
                        <span className="text-amber-600">
                          ({calculationSummary.duplicateCount} already exist)
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{calculation.error}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Primary Action Button */}
              <div className="shrink-0 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAndCreateSlots}
                  disabled={!calculation.valid || calculation.slotCount === 0 || isSubmittingToBackend}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#344e41] text-sm font-bold text-[#f2f0e8] shadow-md transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSubmittingToBackend ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Saving Slots to Backend...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span>Generate &amp; Add to Slots List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Selected Slots Manager List (7 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7">
          <div className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-plum/10 lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:min-h-[620px] overscroll-contain">
            {/* Header & Stats Bar (Pinned at top) */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-6 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#344e41]">
                  Current Timeslots for "{formTitle || 'this role'}"
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-stone-500">
                  {slots.length > 0 ? (
                    <span>
                      <strong className="text-plum">{slots.length}</strong> slot
                      {slots.length === 1 ? '' : 's'} across{' '}
                      <strong className="text-plum">{uniqueDatesCount}</strong> date
                      {uniqueDatesCount === 1 ? '' : 's'}
                    </span>
                  ) : (
                    'No timeslots generated for this role yet'
                  )}
                </p>
              </div>

              {slots.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={unbookedSlotsCount === 0 || isClearing}
                    title={unbookedSlotsCount === 0 ? 'No unbooked timeslots to clear' : 'Clear all unbooked timeslots'}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Container for Slots */}
            <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain p-6 pt-4 [scrollbar-width:thin]">
              {/* Loading Indicator for Backend Slots */}
              {loadingBackendSlots && (
                <div className="mb-4 flex items-center gap-2 text-xs text-stone-500">
                  <svg className="h-4 w-4 animate-spin text-teal" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Loading timeslots from database...</span>
                </div>
              )}

              {/* Date-Grouped Cards or Empty State */}
              {groupedSlots.length > 0 ? (
                <div className="space-y-6">
                  {groupedSlots.map((group) => (
                    <div
                      key={group.date}
                      className="overflow-hidden rounded-xl border border-stone-200 bg-[#fffef9] shadow-sm transition"
                    >
                      {/* Date Header & Quick Controls */}
                      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f7f5ed] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-plum">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          <span className="text-sm font-bold text-[#344e41]">
                            {formatDateHeader(group.date)}
                          </span>
                        </div>

                        {/* Total slots badge */}
                        <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[11px] font-bold text-teal">
                          {group.total} {group.total === 1 ? 'slot' : 'slots'}
                        </span>
                      </div>

                      {/* Individual Slot Pills Grid */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
                          {group.slots.map((slot) => {
                            const isBooked = slot.status === 'BOOKED';

                            return (
                              <div
                                key={slot.id}
                                className={`group relative flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs shadow-sm transition select-none ${
                                  isBooked
                                    ? 'border-amber-300 bg-amber-50/80 text-amber-900'
                                    : 'border-[#344e41] bg-[#344e41] text-[#f2f0e8]'
                                }`}
                              >
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                  <div className="flex min-w-0 items-center gap-1.5 font-bold">
                                    {!isBooked && (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3 shrink-0 text-gold">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                    <span>
                                      {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className={isBooked ? 'text-amber-800/80' : 'text-white/70'}>
                                      {slot.duration}m
                                    </span>
                                    {isBooked ? (
                                      <span className="rounded bg-amber-200 px-1 py-0.2 text-[9px] font-bold text-amber-900">
                                        BOOKED
                                      </span>
                                    ) : (
                                      <span className="rounded bg-[#a7eda7]/60 px-1 py-0.2 text-[9px] font-bold text-[#0d6921]">
                                        AVAILABLE
                                      </span>
                                    )}
                                  </div>
                                  {isBooked && slot.candidateEmail && (
                                    <span className="truncate text-[9px] text-amber-800">
                                      {slot.candidateEmail}
                                    </span>
                                  )}
                                </div>

                                {/* Inline Trash delete button */}
                                <button
                                  type="button"
                                  aria-label="Delete timeslot"
                                  disabled={isBooked || deletingSlotId === slot.id}
                                  title={isBooked ? 'Booked slots cannot be deleted' : 'Delete timeslot'}
                                  onClick={() => handleDeleteSlot(slot)}
                                  className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${
                                    isBooked
                                      ? 'cursor-not-allowed opacity-30 text-stone-400'
                                      : deletingSlotId === slot.id
                                      ? 'cursor-wait opacity-60 text-red-400'
                                      : 'text-red-400 hover:bg-red-500/20 hover:text-red-300 active:scale-95'
                                  }`}
                                >
                                  {deletingSlotId === slot.id ? (
                                    <svg className="h-3.5 w-3.5 animate-spin text-red-400" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <circle cx="12" cy="14" r="1.5" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#344e41]">No timeslots created yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-500">
                    Select an interview date and time range on the left, then click &ldquo;Generate &amp; Add to Slots List&rdquo;
                    to save availability for {`"${formTitle}"` || 'this job listing'}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Clear All Confirmation Modal with 3-second countdown */}
      <ClearAllSlotsModal
        open={showClearConfirm}
        slotCount={unbookedSlotsCount}
        totalCount={slots.length}
        isClearing={isClearing}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
      />
    </div>
  );
}
