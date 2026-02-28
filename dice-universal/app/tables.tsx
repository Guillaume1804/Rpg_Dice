import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";
import { listTables, TableRow } from "../data/repositories/tablesRepo";

export default function TablesScreen() {
  const db = useDb();
  const router = useRouter();
  const [tables, setTables] = useState<TableRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setActiveTableId, activeTableId } = useActiveTable();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const rows = await listTables(db);
          if (isActive) setTables(rows);
        } catch (e: any) {
          if (isActive) setError(e?.message ?? String(e));
        }
      })();

      return () => {
        isActive = false;
      };
    }, [db])
  );

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
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Mes tables</Text>

      <FlatList
        style={{ marginTop: 12 }}
        data={tables}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              await setActiveTableId(item.id);
              router.push(`/tables/${item.id}` as any);
            }}
            style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
          >
            {activeTableId === item.id ? (
              <Text style={{ marginBottom: 6, fontWeight: "600" }}>✅ Active</Text>
            ) : null}

            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>

            <Text style={{ marginTop: 4, opacity: 0.7 }}>
              {item.is_system === 1 ? "Table système" : "Table perso"}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}