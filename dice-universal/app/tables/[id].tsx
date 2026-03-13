// app/tables/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import { useDb } from "../../data/db/DbProvider";

import {
  updateTableName,
} from "../../data/repositories/tablesRepo";

import {
  createProfile,
  updateProfileName,
  deleteProfile,
  ProfileRow,
} from "../../data/repositories/profilesRepo";

import {
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

import { newId } from "../../core/types/ids";

import { useTableDetailData } from "./hooks/useTableDetailData";
import { TableProfilesSection } from "./components/TableProfilesSection";
import { TableProfileModals } from "./components/TableProfileModals";
import { TableGroupModals } from "./components/TableGroupModals";
import { TableDieModals } from "./components/TableDieModals";

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const tableId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

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

  const {
    table,
    profiles,
    error,
    load,
    getRuleName,
    pipelineRules,
    legacyRules,
  } = useTableDetailData({
    db,
    tableId,
  });

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
        <TableProfilesSection
          profiles={profiles}
          isSystem={isSystem}
          getRuleName={getRuleName}
          onRenameProfile={openRenameProfileModal}
          onCreateGroup={(profile) => {
            setTargetProfileForNewGroup(profile);
            setNewGroupName("");
            setNewGroupRuleId(null);
            setShowCreateGroupModal(true);
          }}
          onDeleteProfile={async (profile) => {
            await deleteProfile(db, profile.id);
            await load();
          }}
          onRenameGroup={openRenameGroupModal}
          onEditGroupRule={openEditGroupRuleModal}
          onCreateDie={(group) => {
            setTargetGroupForNewDie(group);
            setNewDieSides("6");
            setNewDieQty("1");
            setNewDieModifier("0");
            setNewDieSign("1");
            setNewDieRuleId(null);
            setShowCreateDieModal(true);
          }}
          onDeleteGroup={async (group) => {
            await deleteGroup(db, group.id);
            await load();
          }}
          onEditDie={openEditDieModal}
          onDeleteDie={async (die) => {
            await deleteGroupDie(db, die.id);
            await load();
          }}
        />
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

      <TableGroupModals
        showCreateGroupModal={showCreateGroupModal}
        targetProfileForNewGroup={targetProfileForNewGroup}
        newGroupName={newGroupName}
        newGroupRuleId={newGroupRuleId}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onChangeNewGroupName={setNewGroupName}
        onSelectNewGroupRuleId={setNewGroupRuleId}
        onCloseCreateGroupModal={() => {
          setShowCreateGroupModal(false);
          resetCreateGroupForm();
        }}
        onSubmitCreateGroup={async () => {
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
        showRenameGroupModal={showRenameGroupModal}
        renameGroupValue={renameGroupValue}
        onChangeRenameGroupValue={setRenameGroupValue}
        onCloseRenameGroupModal={() => {
          setShowRenameGroupModal(false);
          setEditingGroup(null);
          setRenameGroupValue("");
        }}
        onSubmitRenameGroup={async () => {
          const name = renameGroupValue.trim();
          if (!editingGroup || !name) return;
        
          await updateGroupName(db, editingGroup.id, name);
        
          setShowRenameGroupModal(false);
          setEditingGroup(null);
          setRenameGroupValue("");
        
          await load();
        }}
        showEditGroupRuleModal={showEditGroupRuleModal}
        editingGroupForRule={editingGroupForRule}
        selectedGroupRuleId={selectedGroupRuleId}
        onSelectGroupRuleId={setSelectedGroupRuleId}
        onCloseEditGroupRuleModal={() => {
          setShowEditGroupRuleModal(false);
          setEditingGroupForRule(null);
          setSelectedGroupRuleId(null);
        }}
        onSubmitEditGroupRule={async () => {
          if (!editingGroupForRule) return;
        
          await updateGroupRuleId(
            db,
            editingGroupForRule.id,
            selectedGroupRuleId ?? null
          );
        
          setShowEditGroupRuleModal(false);
          setEditingGroupForRule(null);
          setSelectedGroupRuleId(null);
        
          await load();
        }}
      />

      <TableProfileModals
        showCreateProfileModal={showCreateProfileModal}
        newProfileName={newProfileName}
        onChangeNewProfileName={setNewProfileName}
        onCloseCreateProfileModal={() => {
          setShowCreateProfileModal(false);
          resetCreateProfileForm();
        }}
        onSubmitCreateProfile={async () => {
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
        showRenameProfileModal={showRenameProfileModal}
        renameProfileValue={renameProfileValue}
        onChangeRenameProfileValue={setRenameProfileValue}
        onCloseRenameProfileModal={() => {
          setShowRenameProfileModal(false);
          setEditingProfile(null);
          setRenameProfileValue("");
        }}
        onSubmitRenameProfile={async () => {
          const name = renameProfileValue.trim();
          if (!editingProfile || !name) return;
        
          await updateProfileName(db, editingProfile.id, name);
        
          setShowRenameProfileModal(false);
          setEditingProfile(null);
          setRenameProfileValue("");
        
          await load();
        }}
      />

      <TableDieModals
        showCreateDieModal={showCreateDieModal}
        targetGroupForNewDie={targetGroupForNewDie}
        newDieSides={newDieSides}
        newDieQty={newDieQty}
        newDieModifier={newDieModifier}
        newDieSign={newDieSign}
        newDieRuleId={newDieRuleId}
        pipelineRules={pipelineRules}
        legacyRules={legacyRules}
        onChangeNewDieSides={setNewDieSides}
        onChangeNewDieQty={setNewDieQty}
        onChangeNewDieModifier={setNewDieModifier}
        onChangeNewDieSign={setNewDieSign}
        onChangeNewDieRuleId={setNewDieRuleId}
        onCloseCreateDieModal={() => {
          setShowCreateDieModal(false);
          resetCreateDieForm();
        }}
        onSubmitCreateDie={async () => {
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
        editingDie={editingDie}
        editDieSides={editDieSides}
        editDieQty={editDieQty}
        editDieModifier={editDieModifier}
        editDieSign={editDieSign}
        selectedRuleId={selectedRuleId}
        onChangeEditDieSides={setEditDieSides}
        onChangeEditDieQty={setEditDieQty}
        onChangeEditDieModifier={setEditDieModifier}
        onChangeEditDieSign={setEditDieSign}
        onChangeSelectedRuleId={setSelectedRuleId}
        onCloseEditDieModal={() => {
          setEditingDie(null);
          setSelectedRuleId(null);
        }}
        onSubmitEditDie={async () => {
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
      />

    </View>
  );
}