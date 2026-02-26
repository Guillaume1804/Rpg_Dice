import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { listProfiles, ProfileRow } from "../data/repositories/profilesRepo";
import { useDb } from "../data/db/DbProvider";

export default function TablesScreen() {
  const db = useDb();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listProfiles(db);
        setProfiles(rows);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db]);

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
        data={profiles}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/tables/${item.id}` as any)}
            style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
            <Text style={{ marginTop: 4, opacity: 0.7 }}>
              ruleset: {item.ruleset_id}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}