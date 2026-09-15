import { useNavigation } from '../../context/NavigationContext';
import { getFormStatus, getNextFormsStatusTime } from '../../utils/forms';
import { useNow } from '../../hooks/useNow';

function StatusPill({ status }) {
  const live = status === 'Live';
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold leading-none ${
        live ? 'bg-teal/10 text-teal' : 'bg-stone-100 text-stone-500'
      }`}
    >
      {status}
    </span>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function JobListings({ forms = [], loading = false }) {
  const { goToJobListings, goToSubmissionsWs } = useNavigation();
  const now = useNow(getNextFormsStatusTime(forms));

  const allJobs = (Array.isArray(forms) ? forms : []).map((form) => ({
    id: form.id,
    title: form.title,
    meta:
      (form.description && form.description.slice(0, 60)) ||
      (form.requirements && form.requirements.slice(0, 60)) ||
      'No description',
    status: getFormStatus(form, now),
    live: getFormStatus(form, now) === 'Live',
    applicants: form.submissionCount ?? 0,
  }));

  const jobs = allJobs
    .slice()
    .sort((a, b) => Number(b.live) - Number(a.live))
    .slice(0, 5);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10">
      <h2 className="font-sans text-lg font-bold text-plum">Job Listings</h2>

      {loading ? (
        <div className="mt-4 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-3 w-2/5 animate-pulse rounded-full bg-plum/10" />
              <div className="flex items-center gap-3">
                <div className="h-5 w-14 animate-pulse rounded-md bg-plum/10" />
                <div className="h-3 w-8 animate-pulse rounded-full bg-plum/10" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <ul className="mt-2 divide-y divide-plum/10">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                {job.status === 'Live' ? (
                  <button
                    type="button"
                    onClick={() => goToSubmissionsWs(job.id)}
                    className="block w-full truncate text-left text-sm font-semibold text-[#344e41] transition hover:text-plum"
                    title={`View applicants for ${job.title}`}
                  >
                    {job.title}
                  </button>
                ) : (
                  <p className="truncate text-sm font-semibold text-stone-400">{job.title}</p>
                )}
                <p className="mt-0.5 truncate text-xs text-stone-500">{job.meta}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <StatusPill status={job.status} />
                {job.status === 'Live' && (
                  <button
                    type="button"
                    onClick={() => goToSubmissionsWs(job.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-plum"
                  >
                    <UsersIcon />
                    {job.applicants}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-stone-500">No job listings yet.</p>
      )}

      <div className="mt-4 border-t border-plum/10 pt-4">
        <button
          type="button"
          onClick={goToJobListings}
          className="w-full rounded-full bg-white py-2.5 text-xs font-semibold text-plum shadow-sm ring-1 ring-plum/10 transition hover:bg-[#588157] hover:text-white hover:shadow-md hover:ring-[#588157]"
        >
          View all forms
        </button>
      </div>
    </section>
  );
}

export default JobListings;