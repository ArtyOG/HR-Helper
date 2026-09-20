import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getForm, getInterviewBooking, listAvailableInterviewSlots } from '../services/api';
import CandidateSlotPicker from '../components/interview/CandidateSlotPicker';
import BookingConfirmation from '../components/interview/BookingConfirmation';

export default function CandidateSchedule() {
  const { formId, submissionId } = useParams();

  const [form, setForm] = useState(null);
  const [booking, setBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available slots for this form
  const fetchAvailableSlots = useCallback(async (targetFormId) => {
    if (!targetFormId) return;
    try {
      const slots = await listAvailableInterviewSlots(targetFormId);
      setAvailableSlots(slots || []);
    } catch (err) {
      console.error('Failed to load available interview slots:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!formId || !submissionId) {
        setError('Invalid interview link. Missing position or submission identifier.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Step 1: Check if candidate already has a confirmed booking
        let existingBooking = null;
        try {
          existingBooking = await getInterviewBooking(submissionId);
        } catch (bookingErr) {
          // 404 indicates no booking exists yet, which is expected for unbooked candidates
          if (bookingErr.status !== 404 && !bookingErr.message?.includes('404')) {
            console.warn('Booking check returned unexpected error:', bookingErr);
          }
        }

        if (!isMounted) return;

        // Fetch form metadata
        const formData = await getForm(formId);
        if (!isMounted) return;
        setForm(formData);

        if (existingBooking) {
          setBooking(existingBooking);
          setLoading(false);
          return;
        }

        // Step 2: Unbooked candidate -> fetch available timeslots
        const slots = await listAvailableInterviewSlots(formId);
        if (!isMounted) return;
        setAvailableSlots(slots || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load interview scheduling information.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [formId, submissionId]);

  // Handle successful slot booking
  const handleBookingSuccess = (newBooking) => {
    setBooking(newBooking);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f2efe7] font-sans text-stone-800 antialiased">
      {/* Header matching ApplyForm */}
      <header className="sticky top-0 z-50 border-b border-plum/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-teal">
              <span className="font-serif text-xl font-bold text-white">H</span>
              <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-gold" />
            </span>
            <span className="text-xl font-bold tracking-tight text-plum">
              HiORing
            </span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-stone-300/60" />
            <div className="h-4 w-1/3 animate-pulse rounded-lg bg-stone-300/50" />
            <div className="h-64 animate-pulse rounded-3xl bg-stone-300/40" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg ring-1 ring-red-500/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-plum">
              Unable to Load Interview Schedule
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">{error}</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-plum px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-plum-dark"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* Content View */}
        {!loading && !error && (
          <div className="space-y-8">
            {booking ? (
              /* State 1: Candidate Already Booked */
              <BookingConfirmation booking={booking} form={form} />
            ) : (
              /* State 2: Candidate Picking Timeslot */
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-plum/5 sm:p-10">
                {/* Hero Header */}
                <div className="border-b border-stone-100 pb-6">
                  <h1 className="font-serif text-2xl font-bold text-plum sm:text-3xl">
                    Select Your Interview Timeslot
                  </h1>
                  <p className="mt-2 text-sm text-stone-600 sm:text-base">
                    You have been invited to interview for{' '}
                    <span className="font-bold text-plum">{form?.title || 'this position'}</span>.
                    Please select a date and time that fits your schedule.
                  </p>
                </div>

                {/* Interactive Slot Picker */}
                <div className="mt-6">
                  <CandidateSlotPicker
                    formId={formId}
                    submissionId={submissionId}
                    availableSlots={availableSlots}
                    onBooked={handleBookingSuccess}
                    onRefreshSlots={() => fetchAvailableSlots(formId)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
