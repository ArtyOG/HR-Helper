import { useEffect, useState } from 'react';
import { getApplicantName } from '../utils/applicantName';
import { fetchWorkspaceData, useForms } from '../hooks/useWorkspaceData';
import UserMenu from '../components/common/UserMenu';


const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const formatDay = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const initialsFromEmail = (email = '') => {
  const local = (email || '').split('@')[0] || '';
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const rowTimeLabel = (start, bucket) => {
  const iso = start.toISOString();
  if (bucket === 'today') return `Today · ${formatTime(iso)}`;
  if (bucket === 'done') return `${formatDay(iso)} · ${formatTime(iso)}`;
  return `${formatDay(iso)} · ${formatTime(iso)}`;
};

function InterviewRow({ row, bucket }) {
  const displayName = row.name || row.email;
  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-plum/10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold uppercase text-white">
          {initialsFromEmail(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#344e41]">{displayName}</p>
        </div>
      </div>

      <div className="mt-3 border-t border-plum/10 pt-3">
        {row.role && (
          <span className="truncate rounded-md bg-[#f2f0e8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-plum">
            {row.role}
          </span>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <ClockIcon />
          Due {rowTimeLabel(row.start, bucket)}
        </p>
      </div>
    </li>
  );
}

const PANEL_ICONS = {
  today: null,
  upcoming: 'https://cdn-icons-png.flaticon.com/512/10090/10090250.png',
  done: 'https://cdn-icons-png.flaticon.com/512/25/25643.png',
};

function SchedulePanel({ title, rows, bucket }) {
  const icon = PANEL_ICONS[bucket];
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#344e41]">{title}</h2>
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-teal px-2 text-xs font-bold text-white">
            {rows.length}
          </span>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f0e8] text-plum">
          {icon ? (
            <img src={icon} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
          ) : (
            <CalendarIcon />
          )}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-[#f2f0e8]/60 px-4 py-6 text-center text-sm text-stone-500">
          No {title.toLowerCase()} interviews yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <InterviewRow key={row.slotId} row={row} bucket={bucket} />
          ))}
        </ul>
      )}
    </section>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-plum/10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-2 text-4xl font-bold leading-none tracking-tight text-[#344e41]">{value}</p>
      {note && <p className="mt-2 text-xs font-medium text-stone-400">{note}</p>}
    </div>
  );
}

export default function InterviewSlots() {
  const { forms } = useForms();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalCandidates: 0, today: 0, upcoming: 0, done: 0 });
  const [groups, setGroups] = useState({ today: [], upcoming: [], done: [] });

  useEffect(() => {
    if (!forms) return undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const results = await fetchWorkspaceData(forms);
        if (cancelled) return;

        const subById = new Map();
        results.forEach(({ submissions }) => submissions.forEach((sub) => subById.set(sub.id, sub)));

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const buckets = { today: [], upcoming: [], done: [] };
        let totalCandidates = 0;

        results.forEach(({ form, detail, slots }) => {
          totalCandidates += Number(detail?.submissionCount ?? 0) || 0;
          (slots || []).forEach((slot) => {
            if (slot.status !== 'BOOKED' || !slot.submissionId) return;
            const sub = subById.get(slot.submissionId);
            const start = new Date(slot.startTime);
            const row = {
              slotId: slot.id,
              start,
              email: sub?.email || `Candidate #${String(slot.submissionId).slice(0, 6)}`,
              name: sub ? getApplicantName(sub, detail) : '',
              match: sub?.cvEvaluation?.score != null ? Math.round(Number(sub.cvEvaluation.score)) : null,
              role: detail?.title || form.title || '',
            };
            if (start >= startOfTomorrow) buckets.upcoming.push(row);
            else if (start >= startOfToday) buckets.today.push(row);
            else buckets.done.push(row);
          });
        });

        Object.values(buckets).forEach((list) => list.sort((a, b) => a.start - b.start));

        if (cancelled) return;
        setGroups(buckets);
        setStats({
          totalCandidates,
          today: buckets.today.length,
          upcoming: buckets.upcoming.length,
          done: buckets.done.length,
        });
      } catch (err) {
        if (!cancelled) setError('Could not load the interview schedule. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [forms]);

  const totalBooked = stats.today + stats.upcoming + stats.done;

  return (
    <div className="w-full">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-[51px] w-[51px] items-center justify-center rounded-2xl bg-white text-plum shadow-sm ring-1 ring-plum/10">
                <CalendarIcon />
              </span>
              <div>
                <h1 className="font-sans text-[26px] font-bold leading-none tracking-tight text-[#344e41]">
                  Schedule Interview
                </h1>
                <p className="mt-2 text-sm font-medium text-stone-500">
                  Booked candidate interviews across your jobs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <UserMenu />
            </div>
          </div>

          {loading ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-plum/10" />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-plum/10" />
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl bg-red-100 px-5 py-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Candidate" value={stats.totalCandidates} />
                <StatCard label="Upcoming" value={stats.upcoming} note="Remaining" />
                <StatCard label="Interview Today" value={stats.today} />
                <StatCard label="Done" value={stats.done} />
              </div>

              <p className="mt-6 text-xs font-semibold text-stone-400">
                Only slots that candidates have booked appear here.
              </p>

              {totalBooked === 0 ? (
                <div className="mt-3 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-plum/10">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/25 text-plum">
                    <CalendarIcon />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[#344e41]">No interviews booked yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                    Create interview slots from the Email Sequences step while sending an
                    invitation, then share your scheduling link with candidates so they can pick a
                    time. Booked slots will show up here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                  <SchedulePanel title="Today" rows={groups.today} bucket="today" />
                  <SchedulePanel title="Upcoming" rows={groups.upcoming} bucket="upcoming" />
                  <SchedulePanel title="Done" rows={groups.done} bucket="done" />
                </div>
              )}
            </>
          )}
        </div>
  );
}