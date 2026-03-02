import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import {
  listRules,
  createRule,
  deleteRule,
  RuleRow,
} from "../data/repositories/rulesRepo";
import { newId } from "../core/types/ids";

export default function RulesScreen() {
  const db = useDb();

  const [rules, setRules] = useState<RuleRow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"sum" | "d20" | "pool" | "table_lookup">("sum");

  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const all = await listRules(db);
      setRules(all);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
  }, [db]);

  async function handleCreate() {
    if (!newName.trim()) return;

    try {
      let params = "{}";

      // Params par défaut selon type
      if (newKind === "d20") {
        params = JSON.stringify({
          crit_success: 20,
          crit_failure: 1,
        });
      }

      if (newKind === "pool") {
        params = JSON.stringify({
          success_min: 5,
          glitch_on_ones: true,
        });
      }

      if (newKind === "table_lookup") {
        params = JSON.stringify({
          table: {},
        });
      }

      await createRule(db, {
        name: newName.trim(),
        kind: newKind,
        params_json: params,
        is_system: 0,
      });

      setShowCreateModal(false);
      setNewName("");
      setNewKind("sum");

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
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Règles</Text>

      <Pressable
        onPress={() => setShowCreateModal(true)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
      >
        <Text style={{ fontWeight: "600" }}>Créer une règle</Text>
      </Pressable>

      <ScrollView style={{ marginTop: 12 }}>
        {rules.map((rule) => (
          <View
            key={rule.id}
            style={{
              marginTop: 10,
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
            </Text>

            {rule.is_system !== 1 && (
              <Pressable
                onPress={async () => {
                  await deleteRule(db, rule.id);
                  await load();
                }}
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text>Supprimer</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modal création */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Nouvelle règle
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Nom de la règle"
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 12 }}>Type</Text>

            {["sum", "d20", "pool", "table_lookup"].map((kind) => (
              <Pressable
                key={kind}
                onPress={() => setNewKind(kind as any)}
                style={{
                  marginTop: 6,
                  padding: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: newKind === kind ? 1 : 0.6,
                }}
              >
                <Text style={{ fontWeight: newKind === kind ? "700" : "400" }}>
                  {kind}
                </Text>
              </Pressable>
            ))}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginRight: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleCreate}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}