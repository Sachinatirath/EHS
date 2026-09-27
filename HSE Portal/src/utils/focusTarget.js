import { useEffect, useRef, useState } from 'react';

// One-shot "open this record" hand-off between screens: an alert or a My Tasks
// row sets a target for a list view, and that view scrolls to the row,
// highlights it briefly, then opens its details.
const targets = new Map();

export function setFocusTarget(view, id) {
  targets.set(view, id);
}

export function peekFocusTarget(view) {
  return targets.get(view) ?? null;
}

const FLASH_MS = 2600;
const OPEN_AFTER_MS = 1400;

/**
 * `ids` are the ids currently rendered by the view; once the target is among
 * them it is highlighted and `onOpen(id)` is called shortly after.
 * Returns `rowProps(id)` to spread on each row and `hasTarget` (true while a
 * target is waiting, so the view can widen its filters).
 */
export function useFocusTarget(view, ids, onOpen) {
  const [target, setTarget] = useState(() => targets.get(view) ?? null);
  const [flashId, setFlashId] = useState(null);
  const timers = useRef([]);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const key = ids.join(',');

  useEffect(() => {
    if (target == null || !ids.some((id) => String(id) === String(target))) return;
    targets.delete(view);
    setTarget(null);
    setFlashId(target);
    requestAnimationFrame(() => {
      document.querySelector(`[data-focus-id="${view}:${target}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    timers.current.push(
      setTimeout(() => openRef.current?.(target), OPEN_AFTER_MS),
      setTimeout(() => setFlashId(null), FLASH_MS),
    );
  }, [key, target, view]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return {
    hasTarget: target != null,
    rowProps: (id) => ({
      'data-focus-id': `${view}:${id}`,
      className: flashId != null && String(flashId) === String(id) ? 'row-flash' : undefined,
    }),
  };
}
