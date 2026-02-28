import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useDb } from "../../data/db/DbProvider";
import { getProfileById, ProfileRow, updateProfileName  } from "../../data/repositories/profilesRepo";
import { getRulesetById, RulesetRow } from "../../data/repositories/rulesetsRepo";
import { listGroupsByProfileId, listDiceByGroupId, GroupRow, GroupDieRow } from "../../data/repositories/groupsRepo";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

export default function TableDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [ruleset, setRuleset] = useState<RulesetRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [renameValue, setRenameValue] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;

    (async () => {
      try {
        setError(null);

        const p = await getProfileById(db, profileId);
        setProfile(p);

        if (!p) {
          setRuleset(null);
          setGroups([]);
          return;
        }

        const r = await getRulesetById(db, p.ruleset_id);
        setRuleset(r);

        const gs = await listGroupsByProfileId(db, profileId);
        const withDice: GroupWithDice[] = [];
        for (const g of gs) {
          const dice = await listDiceByGroupId(db, g.id);
          withDice.push({ group: g, dice });
        }
        setGroups(withDice);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db, profileId]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Table introuvable</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>id: {profileId}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{profile.name}</Text>

      {profile.is_system !== 1 ? (
        <Pressable
          onPress={() => {
            setRenameValue(profile.name);
            setShowRenameModal(true);
          }}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Renommer</Text>
        </Pressable>
      ) : (
        <Text style={{ opacity: 0.7 }}>
          Table système : renommage interdit
        </Text>
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
                  if (!profile) return;
                  if (profile.is_system === 1) return;
                
                  await updateProfileName(db, profile.id, name);
                
                  // refresh local
                  const refreshed = await getProfileById(db, profile.id);
                  setProfile(refreshed);
                
                  setShowRenameModal(false);
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
        <Text style={{ fontWeight: "600" }}>Ruleset</Text>
        <Text style={{ marginTop: 6 }}>{ruleset ? ruleset.name : "—"}</Text>
        <Text style={{ marginTop: 4, opacity: 0.7 }}>
          mode: {ruleset ? ruleset.mode : "—"}
        </Text>
      </View>

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
                  <Text key={d.id} style={{ marginTop: 6 }}>
                    {d.qty}d{d.sides}
                    {d.modifier ? `  (mod ${d.modifier >= 0 ? "+" : ""}${d.modifier})` : ""}
                  </Text>
                ))
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}