import { useNavigation } from '../../context/NavigationContext';
import { initialsFromNameOrEmail } from '../../utils/applicantName';

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function JoinIcon() {
  return (
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
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-2 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-[43px] w-[43px] animate-pulse rounded-full bg-plum/10" />
          <div className="flex-1">
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-plum/10" />
            <div className="mt-2 h-1.5 w-2/3 animate-pulse rounded-full bg-plum/10" />
          </div>
          <div className="h-5 w-14 animate-pulse rounded-md bg-plum/10" />
        </div>
      ))}
    </div>
  );
}

function UpcomingInterviews({ interviews = [], loading = false }) {
  const { goToInterviewSlotsWs } = useNavigation();

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10">
      <div className="flex items-center gap-2">
          <h2 className="font-sans text-lg font-bold text-plum">Upcoming Interviews</h2>
          {interviews.length > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-teal px-2 text-[11px] font-bold text-white">
              {interviews.length}
            </span>
          )}
        </div>

      {loading ? (
        <LoadingSkeleton />
      ) : interviews.length > 0 ? (
        <ul className="mt-2 divide-y divide-plum/10">
          {interviews.map((interview) => (
            <li key={interview.slotId} className="flex items-center gap-3 py-4">
              <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold uppercase text-white">
                {initialsFromNameOrEmail(
                  interview.name === interview.email ? '' : interview.name,
                  interview.email
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#344e41]">
                  {interview.name || interview.email || 'Candidate'}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {interview.role || 'Interview'}
                </p>
              </div>

              <span className="shrink-0 rounded-md bg-[#DAD7CD] px-2 py-1 text-[11px] font-bold text-plum">
                {formatTime(interview.start)}
              </span>

              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:border-[#588157] hover:bg-[#588157] hover:text-white"
                  title="Join meeting"
                >
                  <JoinIcon />
                  Join
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-stone-500">
          No interviews scheduled for tomorrow yet.
        </p>
      )}

      <div className="mt-4 border-t border-plum/10 pt-4">
        <button
          type="button"
          onClick={goToInterviewSlotsWs}
          className="w-full rounded-full bg-white py-2.5 text-xs font-semibold text-plum shadow-sm ring-1 ring-plum/10 transition hover:bg-[#588157] hover:text-white hover:shadow-md hover:ring-[#588157]"
        >
          View interview schedule
        </button>
      </div>
    </section>
  );
}

export default UpcomingInterviews;
