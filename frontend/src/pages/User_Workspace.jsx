import { useEffect, useState } from 'react';
import Navbar from '../components/user-workspace/Navbar';
import TopBar from '../components/user-workspace/TopBar';
import StatCards from '../components/user-workspace/StatCards';
import TopRankedCandidates from '../components/user-workspace/TopRankedCandidates';
import JobListings from '../components/user-workspace/JobListings';
import { listForms, listSubmissions } from '../services/api';

function User_Workspace() {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const formsData = await listForms();
        if (cancelled) return;
        const allSubmissions = [];
        for (const form of Array.isArray(formsData) ? formsData : []) {
          if (form.submissionCount === 0) continue;
          const subs = await listSubmissions(form.id).catch(() => []);
          if (cancelled) return;
          allSubmissions.push(...(Array.isArray(subs) ? subs : []));
        }
        setForms(Array.isArray(formsData) ? formsData : []);
        setSubmissions(allSubmissions);
      } catch {
        if (!cancelled) {
          setForms([]);
          setSubmissions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formsById = new Map(forms.map((f) => [f.id, f]));

  return (
    <div className="flex min-h-screen bg-[#fffef9] font-sans text-stone-800 antialiased">
      <Navbar />
      <main className="min-w-0 flex-1 px-5 pb-10 pt-24 sm:px-8 lg:ml-[297px] lg:pt-10">
        <div className="mx-auto max-w-site">
          <TopBar />
          <StatCards forms={forms} submissions={submissions} loading={loading} />
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <TopRankedCandidates
                formsById={formsById}
                submissions={submissions}
                loading={loading}
              />
            </div>
            <JobListings forms={forms} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default User_Workspace;