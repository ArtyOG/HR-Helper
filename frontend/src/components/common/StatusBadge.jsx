const SUBMISSION_STATUS_META = {
  PENDING: { label: 'Pending', className: 'bg-gold text-plum', dot: 'bg-plum' },
  APPROVED: { label: 'Approved', className: 'bg-[#a7eda7] text-[#0d6921]', dot: 'bg-[#0d6921]' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700', dot: 'bg-red-600' },
};

const FORM_STATUS_META = {
  Live: { label: 'Live', className: 'bg-[#a7eda7] text-[#0d6921]', dot: 'bg-[#0d6921]' },
  Scheduled: { label: 'Scheduled', className: 'bg-gold text-plum', dot: 'bg-plum' },
  Closed: {
    label: 'Closed',
    className: 'bg-white text-[#757575] ring-1 ring-plum/10',
    dot: 'bg-[#757575]',
  },
};

export default function StatusBadge({ status, preset = 'submission' }) {
  const meta =
    (preset === 'form' ? FORM_STATUS_META : SUBMISSION_STATUS_META)[status] ?? {
      label: status || '—',
      className: 'bg-stone-100 text-stone-500',
      dot: 'bg-stone-400',
    };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${meta.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}