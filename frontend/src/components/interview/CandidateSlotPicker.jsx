import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { bookInterviewSlot } from '../../services/api';
import { formatDateHeader, formatTime12h } from '../../utils/timeslot';

/**
 * Helper to convert ISO date string into local YYYY-MM-DD
 */
function toLocalDateKey(isoString) {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export default function CandidateSlotPicker({
  submissionId,
  availableSlots = [],
  onBooked,
  onRefreshSlots,
}) {
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group available slots by local date
  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const slot of availableSlots) {
      const dateKey = toLocalDateKey(slot.startTime);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    }

    // Sort dates ascending
    const sortedDateKeys = Object.keys(groups).sort();
    return sortedDateKeys.map((dateKey) => ({
      dateKey,
      dateLabel: formatDateHeader(dateKey),
      slots: groups[dateKey].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));
  }, [availableSlots]);

  // Selected date tab state (defaults to first date with available slots)
  const [activeDateKey, setActiveDateKey] = useState(null);

  // Sync activeDateKey when groupedByDate changes if current key is invalid
  const currentDateKey = useMemo(() => {
    if (activeDateKey && groupedByDate.some((g) => g.dateKey === activeDateKey)) {
      return activeDateKey;
    }
    return groupedByDate[0]?.dateKey || null;
  }, [activeDateKey, groupedByDate]);

  // Slots for the current active date
  const currentDaySlots = useMemo(() => {
    const group = groupedByDate.find((g) => g.dateKey === currentDateKey);
    return group ? group.slots : [];
  }, [groupedByDate, currentDateKey]);

  // Selected slot object
  const selectedSlot = useMemo(() => {
    return availableSlots.find((s) => s.id === selectedSlotId) || null;
  }, [availableSlots, selectedSlotId]);

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlotId || !submissionId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const bookedSlot = await bookInterviewSlot(submissionId, selectedSlotId);
      toast.success('Interview slot successfully booked!');
      if (onBooked) {
        onBooked(bookedSlot);
      }
    } catch (err) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('no longer available') ||
        msg.toLowerCase().includes('conflict') ||
        msg.toLowerCase().includes('taken')
      ) {
        toast.error('This timeslot was just claimed by another candidate. Please select another time.');
      } else {
        toast.error(msg || 'Failed to book the interview timeslot.');
      }
      // Re-fetch slots to get fresh state and deselect
      setSelectedSlotId(null);
      if (onRefreshSlots) {
        await onRefreshSlots();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-bold text-plum">No Timeslots Currently Available</h3>
        <p className="mt-2 text-sm text-stone-600">
          All interview timeslots for this position have been booked or the hiring team is preparing new availability.
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Please check back later or contact the recruitment team directly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Tabs Strip */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            1. Select an Interview Date
          </span>
          <span className="text-xs font-semibold text-stone-500">
            {availableSlots.length} available {availableSlots.length === 1 ? 'slot' : 'slots'} across {groupedByDate.length} {groupedByDate.length === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {groupedByDate.map((group) => {
            const isActive = group.dateKey === currentDateKey;
            return (
              <button
                key={group.dateKey}
                type="button"
                onClick={() => {
                  setActiveDateKey(group.dateKey);
                }}
                className={`flex shrink-0 flex-col items-start rounded-xl px-4 py-3 text-left transition ${
                  isActive
                    ? 'bg-plum text-white shadow-md'
                    : 'border border-stone-200 bg-white text-stone-800 hover:border-plum/40 hover:bg-stone-50'
                }`}
              >
                <span className="text-xs font-semibold opacity-90">
                  {group.dateLabel.split(',')[0]}
                </span>
                <span className="text-sm font-bold">
                  {group.dateLabel.split(',').slice(1).join(',').trim()}
                </span>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isActive ? 'bg-gold text-plum' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {group.slots.length} {group.slots.length === 1 ? 'slot' : 'slots'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeslot Grid for Selected Date */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            2. Choose a Time Window
          </span>
          <span className="text-xs text-stone-500">
            Times displayed in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {currentDaySlots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const startTimeStr = toLocalTime12h(slot.startTime);
            const endTimeStr = toLocalTime12h(slot.endTime);
            const durationMins = getDurationMinutes(slot.startTime, slot.endTime);

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-plum bg-plum/5 ring-2 ring-plum shadow-sm'
                    : 'border-stone-200 bg-white hover:border-plum/50 hover:bg-plum/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                      isSelected
                        ? 'bg-plum text-white'
                        : 'bg-stone-100 text-stone-500 group-hover:bg-plum/10 group-hover:text-plum'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      {startTimeStr} – {endTimeStr}
                    </div>
                    <div className="text-xs font-medium text-stone-500">
                      {durationMins} minutes
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-plum text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Slot Summary & Confirmation Action */}
      {selectedSlot && (
        <div className="rounded-2xl border border-plum/20 bg-plum/5 p-5 shadow-sm transition">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-plum">
                  Selected Timeslot
                </span>
                <div className="text-base font-bold text-plum">
                  {formatDateHeader(toLocalDateKey(selectedSlot.startTime))}
                </div>
                <div className="text-sm font-semibold text-stone-700">
                  {toLocalTime12h(selectedSlot.startTime)} – {toLocalTime12h(selectedSlot.endTime)} ({getDurationMinutes(selectedSlot.startTime, selectedSlot.endTime)} min)
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-plum px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-plum-dark active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Confirming...
                </>
              ) : (
                <>
                  <span>Confirm Interview Slot</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
