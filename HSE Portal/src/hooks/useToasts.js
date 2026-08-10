import { useCallback, useRef, useState } from 'react';

let uid = 0;

export default function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 260);
    clearTimeout(timers.current[id]);
  }, []);

  const push = useCallback((message, type = 'info', duration = 3200) => {
    const id = ++uid;
    setToasts((cur) => [...cur, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return { toasts, push, dismiss };
}
