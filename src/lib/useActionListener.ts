import { useEffect, useRef } from 'react';
import { listenToActions } from '@/lib/keymaps';
import { Action } from '@/lib/keymaps';

export function useActionListener(
  match: Action | Action[],
  handler: () => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const matcher = Array.isArray(match) ? match : [match];
    // console.log('useEffect run for', matcher);
    const unlisten = listenToActions((action) => {
      if (matcher.includes(action)) {
        handlerRef.current(); // always fresh!
      }
    });

    return unlisten;
  }, [match]);
}

