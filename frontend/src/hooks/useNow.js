import { useEffect, useRef, useState } from 'react';

const FALLBACK_TICK_MS = 30_000;

export function useNow(nextTime = null) {
  const [now, setNow] = useState(() => Date.now());
  const nextTimeRef = useRef(nextTime);
  nextTimeRef.current = nextTime;

  useEffect(() => {
    let timeoutId = null;
    let intervalId = null;

    const wake = () => setNow(Date.now());

    const schedule = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
      const target = nextTimeRef.current;
      if (target != null && target > Date.now()) {
        timeoutId = window.setTimeout(schedule, target - Date.now());
      } else {
        intervalId = window.setInterval(schedule, FALLBACK_TICK_MS);
      }
      setNow(Date.now());
    };

    schedule();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    const handleFocus = () => setNow(Date.now());

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [nextTime]);

  return now;
}