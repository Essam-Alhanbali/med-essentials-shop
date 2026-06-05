import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "medclub.compare.v1";
const MAX = 3;

interface CompareCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean; // returns success
  remove: (id: string) => void;
  clear: () => void;
  full: boolean;
}

const Ctx = createContext<CompareCtx | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const value = useMemo<CompareCtx>(
    () => ({
      ids,
      has: (id) => ids.includes(id),
      toggle: (id) => {
        let ok = true;
        setIds((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          if (prev.length >= MAX) {
            ok = false;
            return prev;
          }
          return [...prev, id];
        });
        return ok;
      },
      remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
      full: ids.length >= MAX,
    }),
    [ids],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}