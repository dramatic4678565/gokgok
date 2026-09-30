"use client";

import { useEffect, useState } from "react";

/**
 * `false` during SSR and the first client render, `true` afterwards.
 *
 * Zustand's `persist` rehydrates from localStorage after mount, so any
 * component that renders a persisted preference has to agree with the server on
 * the first pass and then correct itself. Gating on this hook keeps React from
 * logging a hydration mismatch.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
