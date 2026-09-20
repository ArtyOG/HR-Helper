import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import { getForm } from '../services/api';
import InterviewTimeslotScheduler from '../components/interview/InterviewTimeslotScheduler';

function InterviewScheduling() {
  const { formId } = useParams();
  const backTo = useFormsBackNav();
  const [form, setForm] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!formId) return;
    let cancelled = false;
    getForm(formId)
      .then((data) => {
        if (!cancelled) setForm(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [formId]);

  return (
    <div className="space-y-6 font-sans">
      {/* Back to Job Listings */}
      <div>
        <button
          type="button"
          onClick={backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-plum"
        >
          <span aria-hidden="true">&larr;</span> Back to all job listings
        </button>
      </div>

      {/* Embedded Timeslot Scheduler for this Job */}
      {formId && (
        <InterviewTimeslotScheduler
          formId={formId}
          formTitle={form?.title || 'Job Listing'}
        />
      )}
    </div>
  );
}

export default InterviewScheduling;
