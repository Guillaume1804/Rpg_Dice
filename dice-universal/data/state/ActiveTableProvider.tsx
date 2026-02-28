import React, { createContext, useContext, useEffect, useState } from "react";
import { useDb } from "../db/DbProvider";
import { getMeta, setMeta, ensureMetaTable } from "../db/database";

type ActiveTableState = {
  activeTableId: string | null;
  setActiveTableId: (id: string) => Promise<void>;
  clearActiveTableId: () => Promise<void>;
};

const Ctx = createContext<ActiveTableState | null>(null);

const META_KEY = "active_table_id";

export function ActiveTableProvider({ children }: { children: React.ReactNode }) {
  const db = useDb();
  const [activeTableId, setActiveTableIdState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await ensureMetaTable(db);
      const id = await getMeta(db, META_KEY);
      setActiveTableIdState(id && id.length > 0 ? id : null);
    })();
  }, [db]);

  async function setActiveTableId(id: string) {
    await setMeta(db, META_KEY, id);
    setActiveTableIdState(id);
  }

  async function clearActiveTableId() {
    await setMeta(db, META_KEY, "");
    setActiveTableIdState(null);
  }

  return (
    <Ctx.Provider value={{ activeTableId, setActiveTableId, clearActiveTableId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActiveTable() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useActiveTable must be used within ActiveTableProvider");
  return v;
}