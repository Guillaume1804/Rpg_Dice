import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useDb } from "../../data/db/DbProvider";
import { getTableById, TableRow, updateTableName } from "../../data/repositories/tablesRepo";
import { listGroupsByTableId, listDiceByGroupId, GroupRow, GroupDieRow } from "../../data/repositories/groupsRepo";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const [table, setTable] = useState<TableRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [renameValue, setRenameValue] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!tableId) return;

    try {
      setError(null);

      const t = await getTableById(db, tableId);
      setTable(t);

      if (!t) {
        setGroups([]);
        return;
      }

      const gs = await listGroupsByTableId(db, tableId);
      const withDice: GroupWithDice[] = [];
      for (const g of gs) {
        const dice = await listDiceByGroupId(db, g.id);
        withDice.push({ group: g, dice });
      }
      setGroups(withDice);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, [db, tableId]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Table introuvable</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>id: {tableId}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{table.name}</Text>

      {table.is_system !== 1 ? (
        <Pressable
          onPress={() => {
            setRenameValue(table.name);
            setShowRenameModal(true);
          }}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Renommer</Text>
        </Pressable>
      ) : (
        <Text style={{ opacity: 0.7 }}>Table système : renommage interdit</Text>
      )}

      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer la table</Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Nouveau nom..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => setShowRenameModal(false)}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = renameValue.trim();
                  if (!name) return;
                  if (table.is_system === 1) return;

                  await updateTableName(db, table.id, name);
                  setShowRenameModal(false);

                  // reload pour MAJ immédiate
                  await load();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Renommer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
        <Text style={{ fontWeight: "600" }}>Groupes</Text>

        {groups.length === 0 ? (
          <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucun groupe.</Text>
        ) : (
          groups.map(({ group, dice }) => (
            <View key={group.id} style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>

              {dice.length === 0 ? (
                <Text style={{ marginTop: 6, opacity: 0.7 }}>Aucun dé.</Text>
              ) : (
                dice.map((d) => (
                  <View key={d.id} style={{ marginTop: 8 }}>
                    <Text>
                      {d.qty}d{d.sides}
                      {d.modifier ? ` (mod ${d.modifier >= 0 ? "+" : ""}${d.modifier})` : ""}
                    </Text>
                    <Text style={{ opacity: 0.7, marginTop: 2 }}>
                      règle: {d.rule_mode}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}