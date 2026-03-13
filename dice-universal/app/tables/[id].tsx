// app/tables/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";

import {
  getTableById,
  TableRow,
  updateTableName,
} from "../../data/repositories/tablesRepo";

import {
  listProfilesByTableId,
  createProfile,
  updateProfileName,
  deleteProfile,
  ProfileRow,
} from "../../data/repositories/profilesRepo";

import {
  listGroupsByProfileId,
  listDiceByGroupId,
  GroupRow,
  GroupDieRow,
  updateGroupDie,
  updateGroupName,
  updateGroupRuleId,
  createGroup,
  deleteGroup,
  createGroupDie,
  deleteGroupDie,
} from "../../data/repositories/groupsRepo";

import { listRules, RuleRow } from "../../data/repositories/rulesRepo";
import { newId } from "../../core/types/ids";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: GroupWithDice[];
};

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const [table, setTable] = useState<TableRow | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithGroups[]>([]);
  const [rules, setRules] = useState<RuleRow[]>([]);

  const [renameValue, setRenameValue] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);

  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const [showRenameProfileModal, setShowRenameProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [renameProfileValue, setRenameProfileValue] = useState("");

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [targetProfileForNewGroup, setTargetProfileForNewGroup] = useState<ProfileRow | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupRuleId, setNewGroupRuleId] = useState<string | null>(null);

  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
  const [renameGroupValue, setRenameGroupValue] = useState("");

  const [showEditGroupRuleModal, setShowEditGroupRuleModal] = useState(false);
  const [editingGroupForRule, setEditingGroupForRule] = useState<GroupRow | null>(null);
  const [selectedGroupRuleId, setSelectedGroupRuleId] = useState<string | null>(null);

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
        setProfiles([]);
        setRules([]);
        return;
      }

      const profileRows = await listProfilesByTableId(db, tableId);
      const nextProfiles: ProfileWithGroups[] = [];

      for (const profile of profileRows) {
        const groupRows = await listGroupsByProfileId(db, profile.id);
        const groupsWithDice: GroupWithDice[] = [];

        for (const group of groupRows) {
          const dice = await listDiceByGroupId(db, group.id);
          groupsWithDice.push({ group, dice });
        }

        nextProfiles.push({
          profile,
          groups: groupsWithDice,
        });
      }

      setProfiles(nextProfiles);

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

  function resetCreateProfileForm() {
    setNewProfileName("");
  }

  function resetCreateGroupForm() {
    setTargetProfileForNewGroup(null);
    setNewGroupName("");
    setNewGroupRuleId(null);
  }

  function resetCreateDieForm() {
    setTargetGroupForNewDie(null);
    setNewDieSides("6");
    setNewDieQty("1");
    setNewDieModifier("0");
    setNewDieSign("1");
    setNewDieRuleId(null);
  }

  function openRenameProfileModal(profile: ProfileRow) {
    setEditingProfile(profile);
    setRenameProfileValue(profile.name);
    setShowRenameProfileModal(true);
  }

  function openRenameGroupModal(group: GroupRow) {
    setEditingGroup(group);
    setRenameGroupValue(group.name);
    setShowRenameGroupModal(true);
  }

  function openEditGroupRuleModal(group: GroupRow) {
    setEditingGroupForRule(group);
    setSelectedGroupRuleId(group.rule_id ?? null);
    setShowEditGroupRuleModal(true);
  }

  function openEditDieModal(die: GroupDieRow) {
    setEditingDie(die);
    setEditDieSides(String(die.sides));
    setEditDieQty(String(die.qty));
    setEditDieModifier(String(die.modifier ?? 0));
    setEditDieSign((die.sign ?? 1) === -1 ? "-1" : "1");
    setSelectedRuleId(die.rule_id ?? null);
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
              resetCreateProfileForm();
              setShowCreateProfileModal(true);
            }}
            style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text>Créer un profil</Text>
          </Pressable>
        </View>
      )}

      <ScrollView>
        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>Profils</Text>

          {profiles.length === 0 ? (
            <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucun profil.</Text>
          ) : (
            profiles.map(({ profile, groups }) => (
              <View key={profile.id} style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "800" }}>{profile.name}</Text>

                {!isSystem ? (
                  <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                    <Pressable
                      onPress={() => openRenameProfileModal(profile)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                    >
                      <Text>Renommer le profil</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setTargetProfileForNewGroup(profile);
                        setNewGroupName("");
                        setNewGroupRuleId(null);
                        setShowCreateGroupModal(true);
                      }}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                    >
                      <Text>Créer une action</Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        await deleteProfile(db, profile.id);
                        await load();
                      }}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}
                    >
                      <Text>Supprimer le profil</Text>
                    </Pressable>
                  </View>
                ) : null}

                {groups.length === 0 ? (
                  <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune action.</Text>
                ) : (
                  groups.map(({ group, dice }) => (
                    <View key={group.id} style={{ marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700" }}>{group.name}</Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        règle de groupe : {getRuleName(group.rule_id)}
                      </Text>

                      {!isSystem ? (
                        <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                          <Pressable
                            onPress={() => openRenameGroupModal(group)}
                            style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                          >
                            <Text>Renommer l’action</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => openEditGroupRuleModal(group)}
                            style={{ padding: 8, borderWidth: 1, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                          >
                            <Text>Règle de l’action</Text>
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
                            <Text>Supprimer l’action</Text>
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
                              règle d’entrée : {getRuleName(d.rule_id)}
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
            ))
          )}
        </View>
      </ScrollView>

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

      <Modal
        visible={showCreateProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCreateProfileModal(false);
          resetCreateProfileForm();
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Créer un profil</Text>

            <TextInput
              value={newProfileName}
              onChangeText={setNewProfileName}
              placeholder="Ex: Guerrier, Mage, Samouraï..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  setShowCreateProfileModal(false);
                  resetCreateProfileForm();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = newProfileName.trim();
                  if (!name) return;

                  await createProfile(db, {
                    id: await newId(),
                    table_id: table.id,
                    name,
                  });

                  setShowCreateProfileModal(false);
                  resetCreateProfileForm();
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

      <Modal
        visible={showRenameProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRenameProfileModal(false);
          setEditingProfile(null);
          setRenameProfileValue("");
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer le profil</Text>

            <TextInput
              value={renameProfileValue}
              onChangeText={setRenameProfileValue}
              placeholder="Nouveau nom du profil..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  setShowRenameProfileModal(false);
                  setEditingProfile(null);
                  setRenameProfileValue("");
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = renameProfileValue.trim();
                  if (!editingProfile || !name) return;

                  await updateProfileName(db, editingProfile.id, name);

                  setShowRenameProfileModal(false);
                  setEditingProfile(null);
                  setRenameProfileValue("");

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

      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCreateGroupModal(false);
          resetCreateGroupForm();
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, maxHeight: "90%" }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Créer une action</Text>

            {targetProfileForNewGroup ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Profil : {targetProfileForNewGroup.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Nom de l’action</Text>
              <TextInput
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Ex: Attaque, Esquive, Dégâts..."
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle de groupe</Text>

              <Pressable
                onPress={() => setNewGroupRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: newGroupRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: newGroupRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => setNewGroupRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newGroupRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: newGroupRuleId === rule.id ? "700" : "400" }}>
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
                      onPress={() => setNewGroupRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: newGroupRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: newGroupRuleId === rule.id ? "700" : "400" }}>
                        {rule.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  setShowCreateGroupModal(false);
                  resetCreateGroupForm();
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const name = newGroupName.trim();
                  if (!name || !targetProfileForNewGroup) return;

                  await createGroup(db, {
                    profileId: targetProfileForNewGroup.id,
                    name,
                    rule_id: newGroupRuleId ?? null,
                  });

                  setShowCreateGroupModal(false);
                  resetCreateGroupForm();
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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer l’action</Text>

            <TextInput
              value={renameGroupValue}
              onChangeText={setRenameGroupValue}
              placeholder="Nouveau nom de l’action..."
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
                  if (!editingGroup || !name) return;

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

      <Modal
        visible={showEditGroupRuleModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowEditGroupRuleModal(false);
          setEditingGroupForRule(null);
          setSelectedGroupRuleId(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, maxHeight: "90%" }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Modifier la règle de l’action</Text>

            {editingGroupForRule ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Action : {editingGroupForRule.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Pressable
                onPress={() => setSelectedGroupRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: selectedGroupRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: selectedGroupRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => setSelectedGroupRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: selectedGroupRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: selectedGroupRuleId === rule.id ? "700" : "400" }}>
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
                      onPress={() => setSelectedGroupRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: selectedGroupRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: selectedGroupRuleId === rule.id ? "700" : "400" }}>
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
                  setShowEditGroupRuleModal(false);
                  setEditingGroupForRule(null);
                  setSelectedGroupRuleId(null);
                }}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (!editingGroupForRule) return;

                  await updateGroupRuleId(db, editingGroupForRule.id, selectedGroupRuleId ?? null);

                  setShowEditGroupRuleModal(false);
                  setEditingGroupForRule(null);
                  setSelectedGroupRuleId(null);

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
                Action : {targetGroupForNewDie.name}
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

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle d’entrée</Text>

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

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle d’entrée</Text>

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