import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useDb } from "../data/db/DbProvider";
import { useActiveTable } from "../data/state/ActiveTableProvider";
import {
  listTables,
  getTableStats,
  TableRow,
  TableStats,
  deleteTable,
} from "../data/repositories/tablesRepo";

type TableListItem = {
  table: TableRow;
  stats: TableStats;
};

export default function TablesScreen() {
  const db = useDb();
  const router = useRouter();
  const { setActiveTableId, activeTableId, clearActiveTableId } =
    useActiveTable();

  const [tables, setTables] = useState<TableListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteTable(tableId: string) {
    try {
      await deleteTable(db, tableId);

      if (activeTableId === tableId) {
        await clearActiveTableId();
      }

      const rows = await listTables(db);

      const enriched: TableListItem[] = [];
      for (const table of rows) {
        const stats = await getTableStats(db, table.id);
        enriched.push({ table, stats });
      }

      setTables(enriched);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          setError(null);

          const rows = await listTables(db);

          const enriched: TableListItem[] = [];
          for (const table of rows) {
            const stats = await getTableStats(db, table.id);
            enriched.push({ table, stats });
          }

          if (isActive) {
            setTables(enriched);
          }
        } catch (e: any) {
          if (isActive) {
            setError(e?.message ?? String(e));
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [db]),
  );

  const activeTable =
    tables.find((item) => item.table.id === activeTableId) ?? null;

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
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Mes tables</Text>

      <Text style={{ marginTop: 6, opacity: 0.7 }}>
        Choisis une table active pour gérer tes profils et lancer ses actions.
      </Text>

      <View
        style={{
          marginTop: 16,
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Table active</Text>

        {activeTable ? (
          <>
            <Text style={{ opacity: 0.8 }}>{activeTable.table.name}</Text>

            <Pressable
              onPress={async () => {
                await clearActiveTableId();
              }}
              style={{
                marginTop: 4,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontWeight: "700" }}>Retirer la table active</Text>
            </Pressable>
          </>
        ) : (
          <Text style={{ opacity: 0.7 }}>
            Aucune table active sélectionnée.
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => router.push("/rules" as any)}
        style={{
          marginTop: 16,
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontWeight: "600" }}>Gérer les règles</Text>
        <Text style={{ marginTop: 4, opacity: 0.7 }}>
          Créer, modifier et consulter les règles disponibles.
        </Text>
      </Pressable>

      {tables.length === 0 ? (
        <View
          style={{
            marginTop: 16,
            padding: 16,
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            Aucune table disponible
          </Text>
          <Text style={{ marginTop: 6, opacity: 0.7 }}>
            Crée une table depuis le jet libre ou ajoute-en une plus tard.
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={tables}
          keyExtractor={(item) => item.table.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const { table, stats } = item;
            const isActive = activeTableId === table.id;

            return (
              <Pressable
                onPress={async () => {
                  await setActiveTableId(table.id);
                }}
                style={{
                  padding: 14,
                  borderWidth: 1,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700" }}>
                      {table.name}
                    </Text>

                    <Text style={{ marginTop: 4, opacity: 0.7 }}>
                      {table.is_system === 1 ? "Table système" : "Table perso"}
                    </Text>
                  </View>

                  {isActive ? (
                    <View
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>Active</Text>
                    </View>
                  ) : null}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ opacity: 0.8, marginRight: 12 }}>
                    {stats.profile_count} profil
                    {stats.profile_count > 1 ? "s" : ""}
                  </Text>

                  <Text style={{ opacity: 0.8, marginRight: 12 }}>
                    {stats.group_count} action{stats.group_count > 1 ? "s" : ""}
                  </Text>

                  <Text style={{ opacity: 0.8 }}>
                    {stats.die_count} entrée{stats.die_count > 1 ? "s" : ""}
                  </Text>
                </View>

                <Text style={{ marginTop: 10, opacity: 0.6 }}>
                  Appuyer pour ouvrir la table
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <Pressable
                    onPress={async () => {
                      await setActiveTableId(table.id);
                      router.push(`/tables/${table.id}` as any);
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>Ouvrir</Text>
                  </Pressable>

                  {table.is_system !== 1 ? (
                    <Pressable
                      onPress={() => handleDeleteTable(table.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                      }}
                    >
                      <Text>Supprimer</Text>
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
