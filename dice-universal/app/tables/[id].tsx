// app/tables/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";
import { getTableById, TableRow, updateTableName } from "../../data/repositories/tablesRepo";
import {
  listGroupsByTableId,
  listDiceByGroupId,
  GroupRow,
  GroupDieRow,
  updateGroupDieRuleId,
} from "../../data/repositories/groupsRepo";
import { listRules, RuleRow } from "../../data/repositories/rulesRepo";

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
  const [rules, setRules] = useState<RuleRow[]>([]);

  const [renameValue, setRenameValue] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);

  const [editingDie, setEditingDie] = useState<GroupDieRow | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!tableId) return;

    try {
      setError(null);

      const t = await getTableById(db, tableId);
      setTable(t);

      if (!t) {
        setGroups([]);
        setRules([]);
        return;
      }

      const gs = await listGroupsByTableId(db, tableId);
      const withDice: GroupWithDice[] = [];
      for (const g of gs) {
        const dice = await listDiceByGroupId(db, g.id);
        withDice.push({ group: g, dice });
      }
      setGroups(withDice);

      const allRules = await listRules(db);
      setRules(allRules);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, tableId]);

  const getRuleName = (ruleId: string | null) => {
    if (!ruleId) return "Somme (par défaut)";
    return rules.find((r) => r.id === ruleId)?.name ?? "Somme (par défaut)";
  };

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

      {/* Modal renommer */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
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

      {/* Groupes + dés */}
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
                  <View key={d.id} style={{ marginTop: 10 }}>
                    <Text>
                      {d.qty}d{d.sides}
                      {d.modifier ? ` (mod ${d.modifier >= 0 ? "+" : ""}${d.modifier})` : ""}
                    </Text>

                    <Text style={{ opacity: 0.7, marginTop: 2 }}>
                      règle: {getRuleName(d.rule_id)}
                    </Text>

                    <Pressable
                      disabled={table.is_system === 1}
                      onPress={() => {
                        if (table.is_system === 1) return;
                        setEditingDie(d);
                        setSelectedRuleId(d.rule_id ?? null);
                      }}
                      style={{
                        marginTop: 6,
                        padding: 8,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: table.is_system === 1 ? 0.4 : 1,
                      }}
                    >
                      <Text>Modifier règle</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          ))
        )}
      </View>

      {/* Modal modifier règle (rule_id) */}
      <Modal
        visible={!!editingDie}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditingDie(null);
          setSelectedRuleId(null);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Modifier règle</Text>

            <Text style={{ marginTop: 10, opacity: 0.7 }}>
              Sélectionne une règle (Somme = aucune règle)
            </Text>

            {/* Option "Somme" */}
            <Pressable
              onPress={() => setSelectedRuleId(null)}
              style={{
                marginTop: 12,
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                opacity: selectedRuleId === null ? 1 : 0.7,
              }}
            >
              <Text style={{ fontWeight: selectedRuleId === null ? "700" : "400" }}>
                Somme (par défaut)
              </Text>
            </Pressable>

            {/* Liste de règles */}
            <View style={{ marginTop: 12, maxHeight: 260 }}>
              <ScrollView>
                {rules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => setSelectedRuleId(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginTop: 8,
                      opacity: selectedRuleId === rule.id ? 1 : 0.7,
                    }}
                  >
                    <Text style={{ fontWeight: selectedRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                    <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                      type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={() => {
                  setEditingDie(null);
                  setSelectedRuleId(null);
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (!editingDie) return;

                  await updateGroupDieRuleId(db, editingDie.id, selectedRuleId);

                  setEditingDie(null);
                  setSelectedRuleId(null);

                  await load();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}