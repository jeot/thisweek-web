import { useEffect, useRef } from 'react';
import { listenToActions } from '@/lib/keymaps';
import { useAppLogic } from '@/store/appLogic';
import { Action, actions } from '@/types/types';

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

export function useAppLogicForAllActionListeners() {
  const actionRequest = useAppLogic((state) => state.actionRequest);

  actions.forEach((a) => {
    useActionListener(a, () => {
      actionRequest(a);
    });
  });
}
