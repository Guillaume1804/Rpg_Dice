import React, { createContext, useContext, useEffect, useState } from "react";
import { useDb } from "../db/DbProvider";
import { getMeta, setMeta, ensureMetaTable } from "../db/database";

type ActiveProfileState = {
  activeProfileId: string | null;
  setActiveProfileId: (id: string) => Promise<void>;
  clearActiveProfileId: () => Promise<void>;
};

const Ctx = createContext<ActiveProfileState | null>(null);

const META_KEY = "active_profile_id";

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await ensureMetaTable(db);
      const id = await getMeta(db, META_KEY);
      setActiveProfileIdState(id);
    })();
  }, [db]);

  async function setActiveProfileId(id: string) {
    await setMeta(db, META_KEY, id);
    setActiveProfileIdState(id);
  }

  async function clearActiveProfileId() {
    await setMeta(db, META_KEY, "");
    setActiveProfileIdState(null);
  }

  return (
    <Ctx.Provider value={{ activeProfileId, setActiveProfileId, clearActiveProfileId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActiveProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useActiveProfile must be used within ActiveProfileProvider");
  return v;
}