import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { initDb } from "../data/db/init";
import type { Db } from "../data/db/database";

export default function RootLayout() {
  const [db, setDb] = useState<Db | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const database = await initDb();
        setDb(database);
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

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="index" options={{ title: "Accueil" }} />
      <Stack.Screen name="roll" options={{ title: "Jet" }} />
      <Stack.Screen name="tables" options={{ title: "Mes tables" }} />
      <Stack.Screen name="history" options={{ title: "Historique" }} />
    </Stack>
  );
}