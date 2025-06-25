import { useEffect, useRef } from 'react';
import { listenToActions } from '@/lib/keymaps';

export function useActionListener(
  match: string | string[],
  handler: () => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const matcher = Array.isArray(match) ? match : [match];

    const unlisten = listenToActions((action) => {
      if (matcher.includes(action)) {
        handlerRef.current(); // always fresh!
      }
    });

    return unlisten;
  }, [match]);
}

