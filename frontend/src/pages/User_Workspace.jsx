import { useEffect, useState } from 'react';
import TopBar from '../components/user-workspace/TopBar';
import StatCards from '../components/user-workspace/StatCards';
import UpcomingInterviews from '../components/user-workspace/UpcomingInterviews';
import JobListings from '../components/user-workspace/JobListings';
import { fetchWorkspaceData, useForms } from '../hooks/useWorkspaceData';
import { getApplicantName } from '../utils/applicantName';

function User_Workspace() {
  const { forms } = useForms();
  const [submissions, setSubmissions] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!forms) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchWorkspaceData(
          forms.filter((form) => (form.submissionCount ?? 0) > 0)
        );
        if (cancelled) return;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const startOfDayAfter = new Date(startOfTomorrow);
        startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);

        const allSubmissions = [];
        const tomorrowInterviews = [];

        rows.forEach(({ form, detail, submissions: subs, slots }) => {
          allSubmissions.push(...subs);
          (Array.isArray(slots) ? slots : []).forEach((slot) => {
            if (slot.status !== 'BOOKED' || !slot.submissionId) return;
            const start = new Date(slot.startTime);
            if (start < startOfTomorrow || start >= startOfDayAfter) return;
            const sub = subs.find((s) => s.id === slot.submissionId);
            tomorrowInterviews.push({
              slotId: slot.id,
              start,
              email: sub?.email || slot.submission?.email || '',
              name: sub ? getApplicantName(sub, detail) : '',
              role: detail?.title || form.title || '',
              meetingLink: slot.meetingLink || '',
            });
          });
        });

        tomorrowInterviews.sort((a, b) => a.start - b.start);

        setSubmissions(allSubmissions);
        setInterviews(tomorrowInterviews);
      } catch {
        if (!cancelled) {
          setSubmissions([]);
          setInterviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forms]);

  return (
    <>
      <TopBar />
      <StatCards forms={forms} submissions={submissions} loading={loading} />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UpcomingInterviews interviews={interviews} loading={loading} />
        </div>
        <JobListings forms={forms} loading={loading} />
      </div>
    </>
  );
}

export default User_Workspace;