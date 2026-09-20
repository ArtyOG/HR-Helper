import Logo from './Logo';

export default function PageLoader({
  full = false,
  message = 'Loading HiORing',
  subtext = 'Preparing your experience...',
}) {
  return (
    <div
      role="status"
      aria-label={`${message}...`}
      className={`relative flex items-center justify-center overflow-hidden ${
        full ? 'min-h-screen bg-[#F2F0E8] px-4' : 'py-16 px-4'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute h-72 w-72 -translate-y-4 rounded-full bg-gradient-to-tr from-plum/10 via-[#588157]/15 to-gold/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Glassmorphic Loader Card */}
      <div className="relative flex w-full max-w-[280px] flex-col items-center rounded-3xl border border-plum/10 bg-white/85 p-8 shadow-xl shadow-plum/5 backdrop-blur-md transition-all sm:max-w-[320px]">
        {/* Logo Emblem with Orbital Spin Accent */}
        <div className="relative mb-5 flex h-18 w-18 items-center justify-center">
          {/* Subtle outer rotating ring with gradient accent */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-plum/15 border-t-plum border-r-transparent" />

          {/* Inner breathing pulse halo */}
          <div className="absolute inset-2 animate-pulse rounded-full bg-plum/5" />

          {/* HiORing Logo mark */}
          <div className="relative z-10 scale-95 transition-transform">
            <Logo className="block h-8 w-auto" />
          </div>
        </div>

        {/* Message & Animated Dots */}
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 font-sans text-sm font-semibold tracking-tight text-plum">
            <span>{message}</span>
            <span className="inline-flex items-center gap-0.5 pt-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-plum [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-plum [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-plum" />
            </span>
          </p>
          {subtext && (
            <p className="mt-1.5 text-xs font-medium text-stone-500">{subtext}</p>
          )}
        </div>

        {/* Shimmering Indeterminate Progress Bar */}
        <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-plum/10 sm:w-44">
          <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-transparent via-plum to-transparent" />
        </div>
      </div>
    </div>
  );
}
