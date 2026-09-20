export default function PageLoader({ full = false }) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className={`flex items-center justify-center ${
        full ? 'min-h-screen bg-[#F2F0E8]' : 'py-20'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-plum/20 border-t-plum" />
        <span className="text-xs font-semibold tracking-wide text-plum/70">Loading...</span>
      </div>
    </div>
  );
}
