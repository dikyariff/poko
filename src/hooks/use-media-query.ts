"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook powered by `useSyncExternalStore`.
 * Returns `serverDefault` (false by default) during SSR and initial hydration,
 * avoiding hydration mismatches while staying synced with viewport changes.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => {
        mediaQueryList.removeEventListener("change", onStoreChange);
      };
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return serverDefault;
    }
    return window.matchMedia(query).matches;
  }, [query, serverDefault]);

  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
