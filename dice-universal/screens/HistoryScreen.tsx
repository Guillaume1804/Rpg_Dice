import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "expo-router";
import { useDb } from "../data/db/DbProvider";
import { listRecentRollEvents, RollEventRow, deleteAllRollEvents } from "../data/repositories/rollEventsRepo";

type Summary = { title?: string; lines?: string[] };

export default function HistoryScreen() {
  const db = useDb();
  const [rows, setRows] = useState<RollEventRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await listRecentRollEvents(db, 50);
    setRows(r);
  }

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        await load();
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db]);

  // ✅ refresh quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setError(null);
          await load();
        } catch (e: any) {
          setError(e?.message ?? String(e));
        }
      })();
    }, [db])
  );

  async function onClear() {
    try {
      await deleteAllRollEvents(db);
      await load();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Historique</Text>

        <Pressable onPress={onClear} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text>Vider</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ marginTop: 12 }}
        data={rows}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          let summary: Summary = {};
          try {
            summary = JSON.parse(item.summary_json);
          } catch {}

          return (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {summary.title ?? "Jet"}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.7 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>

              {(summary.lines ?? []).map((line, idx) => (
                <Text key={idx} style={{ marginTop: 6 }}>
                  • {line}
                </Text>
              ))}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ marginTop: 12, opacity: 0.7 }}>
            Aucun jet enregistré pour l’instant.
          </Text>
        }
      />
    </View>
  );
}