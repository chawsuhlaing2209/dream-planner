"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type SaveStatus = "saved" | "saving" | "error";

type Ctx = {
  status: SaveStatus;
  /** Wrap any server-action call so the chip shows Saving, then Saved or Could not save. */
  track: <T>(work: Promise<T>) => Promise<T>;
};

const SaveStateContext = createContext<Ctx | null>(null);

export function SaveStateProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const pending = useRef(0);

  const track = useCallback(async <T,>(work: Promise<T>) => {
    pending.current += 1;
    setStatus("saving");
    try {
      const result = await work;
      pending.current -= 1;
      if (pending.current === 0) setStatus("saved");
      return result;
    } catch (err) {
      pending.current -= 1;
      setStatus("error");
      throw err;
    }
  }, []);

  const value = useMemo(() => ({ status, track }), [status, track]);
  return <SaveStateContext.Provider value={value}>{children}</SaveStateContext.Provider>;
}

export function useSaveState(): Ctx {
  const ctx = useContext(SaveStateContext);
  if (!ctx) throw new Error("useSaveState must be used inside SaveStateProvider");
  return ctx;
}
