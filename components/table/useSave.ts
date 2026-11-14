"use client";

import { useCallback, useState } from "react";
import { useSaveState } from "@/components/SaveState";
import type { ActionResult } from "@/lib/actions/fields";

/** Runs a server action through the save chip; keeps the last error message for an inline note. */
export function useSave() {
  const { track } = useSaveState();
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    async (work: Promise<ActionResult>): Promise<boolean> => {
      try {
        await track(
          work.then((r) => {
            if (!r.ok) throw new Error(r.error);
            return r;
          }),
        );
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : "Could not save. Edit the row again to retry.");
        return false;
      }
    },
    [track],
  );
  return { run, error, setError };
}
