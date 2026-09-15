import { getFormStatus, getNextFormsStatusTime } from '../../utils/forms';
import { useNow } from '../../hooks/useNow';

const THEMES = {
  gold: { accent: '#B8860B' },
  teal: { accent: '#23737A' },
  green: { accent: '#588157' },
  ice: { accent: '#0F766E' },
};

function StatCard({ stat }) {
  const theme = THEMES[stat.theme] ?? THEMES.gold;

  return (
    <div className="relative overflow-hidden rounded-xl border border-plum/10 bg-white font-sans shadow-sm">
      <div className="flex flex-col gap-1 px-6 py-5">
        <p className="truncate whitespace-nowrap text-sm" style={{ color: theme.accent }}>
          {stat.title}
        </p>
        <p className="whitespace-nowrap text-4xl font-extrabold leading-10 text-plum">
          {stat.value}
        </p>
        <p className="whitespace-nowrap text-xs text-stone-500">{stat.desc}</p>
      </div>
    </div>
  );
}

function StatCards({ forms = [], submissions = [], loading = false }) {
  const now = useNow(getNextFormsStatusTime(forms));
  const activeJobs = forms.filter((f) => getFormStatus(f, now) === 'Live').length;
  const closedJobs = Math.max(forms.length - activeJobs, 0);
  const totalApplicants = submissions.length;
  const approved = submissions.filter((s) => s.status === 'APPROVED').length;
  const pending = submissions.filter((s) => s.status === 'PENDING').length;
  const rejected = submissions.filter((s) => s.status === 'REJECTED').length;
  const scored = submissions.filter((s) => s.cvEvaluation?.score != null);
  const avg =
    scored.length > 0
      ? Math.round(scored.reduce((sum, s) => sum + Number(s.cvEvaluation?.score) || 0, 0) / scored.length)
      : null;
  const topMatch =
    scored.length > 0
      ? Math.round(Math.max(...scored.map((s) => Number(s.cvEvaluation?.score) || 0)))
      : null;
  const avgPerJob =
    forms.length > 0 ? Math.round((totalApplicants / forms.length) * 10) / 10 : null;

  const stats = [
    {
      theme: 'gold',
      title: 'Active Jobs',
      value: loading ? '…' : String(activeJobs),
      desc: loading ? '—' : `${closedJobs} closed`,
    },
    {
      theme: 'teal',
      title: 'Total Applicants',
      value: loading ? '…' : String(totalApplicants),
      desc: loading
        ? '—'
        : `avg ${avgPerJob != null ? `${avgPerJob} per` : '— /'} ${forms.length} posting${forms.length === 1 ? '' : 's'}`,
    },
    {
      theme: 'green',
      title: 'Approved',
      value: loading ? '…' : String(approved),
      desc: loading ? '—' : `${rejected} rejected · ${pending} pending`,
    },
    {
      theme: 'ice',
      title: 'Avg AI Match Score',
      value: loading ? '…' : avg != null ? `${avg}/100` : '—',
      desc: loading
        ? '—'
        : `best ${topMatch != null ? `${topMatch}/100` : '—'} · ${scored.length} scored CV${scored.length === 1 ? '' : 's'}`,
    },
  ];

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.theme} stat={stat} />
      ))}
    </section>
  );
}

export default StatCards;