export default function ScoreBadge({ score }) {
  const empty = score == null || Number.isNaN(Number(score));
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        empty ? 'bg-stone-200 text-stone-500' : 'bg-gold/25 text-plum'
      }`}
    >
      {empty ? 'No score' : `${score}/100`}
    </span>
  );
}