import { useEffect, useState } from 'react';

const DEFAULT_MESSAGES = [
  'Preparing your workspace...',
  'Connecting to HiORing...',
  'Organizing hiring pipelines...',
  'Almost ready...',
];

export default function PageLoader({
  full = false,
  messages = DEFAULT_MESSAGES,
  message,
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message || index >= messages.length - 1) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => prev + 1);
        setVisible(true);
      }, 200);
    }, 3000);

    return () => clearTimeout(timer);
  }, [index, message, messages.length]);

  const activeMessage = message || messages[index];

  return (
    <div
      role="status"
      aria-label={activeMessage}
      className={`relative flex items-center justify-center overflow-hidden ${
        full ? 'min-h-screen bg-[#F2F0E8] px-4' : 'py-16 px-4'
      }`}
    >
      {/* Ambient background bloom */}
      <div
        className="pointer-events-none absolute h-72 w-72 -translate-y-4 rounded-full bg-gradient-to-tr from-plum/10 via-[#588157]/15 to-gold/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Warm Editorial Loader Card */}
      <div className="relative flex w-full max-w-[280px] flex-col items-center rounded-3xl border border-plum/10 bg-white/90 p-8 shadow-xl shadow-plum/5 backdrop-blur-md transition-all sm:max-w-[320px]">
        {/* HiORing 3-Bar Wave Animated Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            viewBox="0 0 160 110"
            className="h-12 w-auto drop-shadow-sm"
            aria-hidden="true"
          >
            {/* Top Bar - Forest Green */}
            <rect
              className="animate-bar-1"
              x="12"
              y="14"
              width="120"
              height="18"
              rx="9"
              fill="#2d4c3a"
            />
            {/* Middle Bar - Warm Gold */}
            <rect
              className="animate-bar-2"
              x="12"
              y="46"
              width="90"
              height="24"
              rx="12"
              fill="#f0b324"
            />
            {/* Bottom Bar - Deep Teal */}
            <rect
              className="animate-bar-3"
              x="12"
              y="82"
              width="128"
              height="18"
              rx="9"
              fill="#1c7882"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h2 className="font-sans text-xl font-bold tracking-tight text-plum">
          HiORing
        </h2>

        {/* Dynamic Contextual Status Words */}
        <p
          className={`mt-1.5 min-h-[20px] text-center text-xs font-medium text-stone-500 transition-all duration-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-0.5'
          }`}
        >
          {activeMessage}
        </p>

        {/* Shimmering Indeterminate Progress Bar */}
        <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-plum/10 sm:w-44">
          <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-transparent via-[#2d4c3a] to-transparent" />
        </div>
      </div>
    </div>
  );
}
