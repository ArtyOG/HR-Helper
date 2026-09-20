export default function ScoreBar({ score }) {
  const value = Math.min(Number(score) || 0, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-plum/10">
        <div className="h-full rounded-full bg-gold" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-[#344e41]">
        {score != null ? `${score}/100` : '—'}
      </span>
    </div>
  );
}