import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import type { Db } from "./database";
import { initDb } from "./init";

const DbContext = createContext<Db | null>(null);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await initDb();
        setDb(d);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur DB</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text>Initialisation…</Text>
      </View>
    );
  }

  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): Db {
  const db = useContext(DbContext);
  if (!db) throw new Error("useDb must be used within DbProvider");
  return db;
}