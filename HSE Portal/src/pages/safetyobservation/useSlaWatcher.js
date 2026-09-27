import { useEffect, useRef, useState } from 'react';
import { checkSla } from './store';

/** Ticks every second so SLA countdowns stay live, and calls `onEscalated`
 * when an overdue observation was just escalated to the HOD. Returns "now". */
export default function useSlaWatcher(onEscalated, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  const cb = useRef(onEscalated);
  cb.current = onEscalated;

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      if (checkSla()) cb.current?.();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
