"use client";

import { useEffect, useRef, useState } from "react";

/** Keep a tool's answers in this tab only. sessionStorage clears when the tab closes. */
export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const ready = useRef(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = sessionStorage.getItem(key);
        if (raw != null) setValue(JSON.parse(raw) as T);
      } catch {
        // Private mode or unreadable storage. The tool still works for this visit.
      }
      ready.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!ready.current) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked. Answers stay in memory for this visit.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
