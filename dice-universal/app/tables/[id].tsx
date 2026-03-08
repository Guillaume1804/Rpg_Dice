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
  updateGroupDie,
  updateGroupName,
  createGroup,
  deleteGroup,
  createGroupDie,
  deleteGroupDie,
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

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [renameGroupValue, setRenameGroupValue] = useState("");

  const [showCreateDieModal, setShowCreateDieModal] = useState(false);
  const [targetGroupForNewDie, setTargetGroupForNewDie] = useState<GroupRow | null>(null);
  const [newDieSides, setNewDieSides] = useState("6");
  const [newDieQty, setNewDieQty] = useState("1");
  const [newDieModifier, setNewDieModifier] = useState("0");
  const [newDieSign, setNewDieSign] = useState<"1" | "-1">("1");
  const [newDieRuleId, setNewDieRuleId] = useState<string | null>(null);

  const [editingDie, setEditingDie] = useState<GroupDieRow | null>(null);

  const [editDieSides, setEditDieSides] = useState("6");
  const [editDieQty, setEditDieQty] = useState("1");
  const [editDieModifier, setEditDieModifier] = useState("0");
  const [editDieSign, setEditDieSign] = useState<"1" | "-1">("1");
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
  }, [db, tableId]);

  const getRuleName = (ruleId: string | null) => {
    if (!ruleId) return "Somme (par défaut)";
    return rules.find((r) => r.id === ruleId)?.name ?? "Somme (par défaut)";
  };

  const pipelineRules = rules.filter((r) => r.kind === "pipeline");
  const legacyRules = rules.filter((r) => r.kind !== "pipeline");

  function resetCreateDieForm() {
    setTargetGroupForNewDie(null);
    setNewDieSides("6");
    setNewDieQty("1");
    setNewDieModifier("0");
    setNewDieSign("1");
    setNewDieRuleId(null);
  }

  function openEditDieModal(die: GroupDieRow) {
    setEditingDie(die);
    setEditDieSides(String(die.sides));
    setEditDieQty(String(die.qty));
    setEditDieModifier(String(die.modifier ?? 0));
    setEditDieSign((die.sign ?? 1) === -1 ? "-1" : "1");
    setSelectedRuleId(die.rule_id ?? null);
  }

  function openRenameGroupModal(group: GroupRow) {
    setEditingGroup(group);
    setRenameGroupValue(group.name);
    setShowRenameGroupModal(true);
  }

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

  const isSystem = table.is_system === 1;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{table.name}</Text>

      {isSystem ? (
        <Text style={{ opacity: 0.7 }}>Table système : modification interdite</Text>
      ) : (
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={() => {
              setRenameValue(table.name);
              setShowRenameModal(true);
            }}
            style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text>Renommer la table</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setNewGroupName("");
              setShowCreateGroupModal(true);
            }}
            style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text>Créer un groupe</Text>
          </Pressable>
        </View>
      )}

      <ScrollView>
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>Groupes</Text>

          {groups.length === 0 ? (
            <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucun groupe.</Text>
          ) : (
            groups.map(({ group, dice }) => (
              <View key={group.id} style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{group.name}</Text>

                {!isSystem ? (
                  <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                    <Pressable
                      onPress={() => openRenameGroupModal(group)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                    >
                      <Text>Renommer le groupe</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setTargetGroupForNewDie(group);
                        setNewDieSides("6");
                        setNewDieQty("1");
                        setNewDieModifier("0");
                        setNewDieSign("1");
                        setNewDieRuleId(null);
                        setShowCreateDieModal(true);
                      }}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                    >
                      <Text>Ajouter une entrée</Text>
                    </Pressable>
                    
                    <Pressable
                      onPress={async () => {
                        await deleteGroup(db, group.id);
                        await load();
                      }}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}
                    >
                      <Text>Supprimer le groupe</Text>
                    </Pressable>
                  </View>
                ) : null}

                {dice.length === 0 ? (
                  <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune entrée.</Text>
                ) : (
                  dice.map((d) => (
                    <View key={d.id} style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
                      <Text style={{ fontWeight: "700" }}>
                        {d.qty}d{d.sides}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        signe : {d.sign === -1 ? "-" : "+"} | mod : {d.modifier}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        règle : {getRuleName(d.rule_id)}
                      </Text>

                      {!isSystem ? (
                        <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                          <Pressable
                            onPress={() => openEditDieModal(d)}
                            style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                          >
                            <Text>Éditer l’entrée</Text>
                          </Pressable>

                          <Pressable
                            onPress={async () => {
                              await deleteGroupDie(db, d.id);
                              await load();
                            }}
                            style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}
                          >
                            <Text>Supprimer l’entrée</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal renommer table */}
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
                  if (isSystem) return;

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

      {/* Modal création groupe */}
      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateGroupModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Créer un groupe</Text>

            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Ex: Actions, Dégâts, Localisation..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => setShowCreateGroupModal(false)}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = newGroupName.trim();
                  if (!name) return;

                  await createGroup(db, {
                    tableId: table.id,
                    name,
                  });

                  setShowCreateGroupModal(false);
                  setNewGroupName("");
                  await load();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal renommer groupe */}
      <Modal
        visible={showRenameGroupModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRenameGroupModal(false);
          setEditingGroup(null);
          setRenameGroupValue("");
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer le groupe</Text>
      
            <TextInput
              value={renameGroupValue}
              onChangeText={setRenameGroupValue}
              placeholder="Nouveau nom du groupe..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />
      
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  setShowRenameGroupModal(false);
                  setEditingGroup(null);
                  setRenameGroupValue("");
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>
              
              <Pressable
                onPress={async () => {
                  const name = renameGroupValue.trim();
                  if (!editingGroup) return;
                  if (!name) return;
                
                  await updateGroupName(db, editingGroup.id, name);
                
                  setShowRenameGroupModal(false);
                  setEditingGroup(null);
                  setRenameGroupValue("");
                
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

      {/* Modal création entrée */}
      <Modal
        visible={showCreateDieModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCreateDieModal(false);
          resetCreateDieForm();
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, maxHeight: "90%" }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Ajouter une entrée</Text>

            {targetGroupForNewDie ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Groupe : {targetGroupForNewDie.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Faces du dé</Text>
              <TextInput
                value={newDieSides}
                onChangeText={setNewDieSides}
                placeholder="6"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Quantité</Text>
              <TextInput
                value={newDieQty}
                onChangeText={setNewDieQty}
                placeholder="1"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Modificateur</Text>
              <TextInput
                value={newDieModifier}
                onChangeText={setNewDieModifier}
                placeholder="0"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Signe</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => setNewDieSign("1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: newDieSign === "1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: newDieSign === "1" ? "700" : "400" }}>+</Text>
                </Pressable>

                <Pressable
                  onPress={() => setNewDieSign("-1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newDieSign === "-1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: newDieSign === "-1" ? "700" : "400" }}>-</Text>
                </Pressable>
              </View>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle</Text>

              <Pressable
                onPress={() => setNewDieRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: newDieRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: newDieRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => setNewDieRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newDieRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: newDieRuleId === rule.id ? "700" : "400" }}>
                    {rule.name}
                  </Text>
                </Pressable>
              ))}

              {legacyRules.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                  {legacyRules.map((rule) => (
                    <Pressable
                      key={rule.id}
                      onPress={() => setNewDieRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: newDieRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: newDieRuleId === rule.id ? "700" : "400" }}>
                        {rule.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={() => {
                  setShowCreateDieModal(false);
                  resetCreateDieForm();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (!targetGroupForNewDie) return;

                  const sides = Number(newDieSides || "0");
                  const qty = Number(newDieQty || "0");
                  const modifier = Number(newDieModifier || "0");
                  const sign = Number(newDieSign || "1");

                  if (!Number.isFinite(sides) || sides <= 0) return;
                  if (!Number.isFinite(qty) || qty <= 0) return;

                  await createGroupDie(db, {
                    groupId: targetGroupForNewDie.id,
                    sides,
                    qty,
                    modifier: Number.isFinite(modifier) ? modifier : 0,
                    sign: sign === -1 ? -1 : 1,
                    rule_id: newDieRuleId ?? null,
                  });

                  setShowCreateDieModal(false);
                  resetCreateDieForm();
                  await load();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text style={{ fontWeight: "700" }}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal édition complète d'une entrée */}
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
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              maxHeight: "90%",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Éditer l’entrée</Text>
          
            <ScrollView style={{ marginTop: 12 }}>
              <Text>Faces du dé</Text>
              <TextInput
                value={editDieSides}
                onChangeText={setEditDieSides}
                placeholder="6"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Quantité</Text>
              <TextInput
                value={editDieQty}
                onChangeText={setEditDieQty}
                placeholder="1"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Modificateur</Text>
              <TextInput
                value={editDieModifier}
                onChangeText={setEditDieModifier}
                placeholder="0"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Signe</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => setEditDieSign("1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: editDieSign === "1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: editDieSign === "1" ? "700" : "400" }}>+</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setEditDieSign("-1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: editDieSign === "-1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: editDieSign === "-1" ? "700" : "400" }}>-</Text>
                </Pressable>
              </View>
                
              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle</Text>
                
              <Pressable
                onPress={() => setSelectedRuleId(null)}
                style={{
                  marginTop: 8,
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
              
              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
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
                    {rule.is_system === 1 ? "système" : "perso"}
                  </Text>
                </Pressable>
              ))}

              {legacyRules.length > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                  {legacyRules.map((rule) => (
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
                        type: {rule.kind}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>
            
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
                
                  const sides = Number(editDieSides || "0");
                  const qty = Number(editDieQty || "0");
                  const modifier = Number(editDieModifier || "0");
                  const sign = Number(editDieSign || "1");
                
                  if (!Number.isFinite(sides) || sides <= 0) return;
                  if (!Number.isFinite(qty) || qty <= 0) return;
                
                  await updateGroupDie(db, editingDie.id, {
                    sides,
                    qty,
                    modifier: Number.isFinite(modifier) ? modifier : 0,
                    sign: sign === -1 ? -1 : 1,
                    rule_id: selectedRuleId ?? null,
                  });
                
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