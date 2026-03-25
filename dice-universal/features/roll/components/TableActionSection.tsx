import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";
import { formatRuleResult } from "../helpers";

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type Props = {
  profiles: ProfileWithGroups[];
  selectedProfileId: string | null;
  results: GroupRollResult[];
  onSelectProfile: (profileId: string) => void;
  onRollProfile: (profileId: string) => void;
  onRollGroup: (profileId: string, groupId: string) => void;
  onRollAll: () => void;
};

type TableViewMode = "profiles" | "actions" | "result";

function getGroupResult(
  groupId: string,
  results: GroupRollResult[],
): GroupRollResult | null {
  return results.find((result) => result.groupId === groupId) ?? null;
}

export function TableActionSection({
  profiles,
  selectedProfileId,
  results,
  onSelectProfile,
  onRollGroup,
}: Props) {
  const [viewMode, setViewMode] = useState<TableViewMode>("profiles");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedProfile =
    profiles.find((p) => p.profile.id === selectedProfileId) ?? profiles[0] ?? null;

  const selectedAction =
    selectedProfile?.groups.find((entry) => entry.group.id === selectedGroupId) ?? null;

  const selectedActionResult = useMemo(() => {
    if (!selectedGroupId) return null;
    return getGroupResult(selectedGroupId, results);
  }, [selectedGroupId, results]);

  useEffect(() => {
    if (!selectedProfile) {
      setViewMode("profiles");
      setSelectedGroupId(null);
      return;
    }

    if (!selectedAction && viewMode === "result") {
      setViewMode("actions");
    }
  }, [selectedProfile, selectedAction, viewMode]);

  if (!selectedProfile) {
    return (
      <View
        style={{
          marginTop: 12,
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Mode Table</Text>
        <Text style={{ opacity: 0.72 }}>
          Cette table ne contient encore aucun profil.
        </Text>
      </View>
    );
  }

  function openProfile(profileId: string) {
    onSelectProfile(profileId);
    setSelectedGroupId(null);
    setViewMode("actions");
  }

  function openAction(groupId: string) {
    setSelectedGroupId(groupId);
    setViewMode("result");
  }

  function goBackToProfiles() {
    setSelectedGroupId(null);
    setViewMode("profiles");
  }

  function goBackToActions() {
    setViewMode("actions");
  }

  function renderProfilesView() {
    return (
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Profils</Text>

        {profiles.length === 0 ? (
          <Text style={{ opacity: 0.72 }}>
            Aucun profil disponible dans cette table.
          </Text>
        ) : (
          <View style={{ gap: 8 }}>
            {profiles.map((profileEntry) => (
              <Pressable
                key={profileEntry.profile.id}
                onPress={() => openProfile(profileEntry.profile.id)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {profileEntry.profile.name}
                </Text>

                <Text style={{ opacity: 0.72 }}>
                  {profileEntry.groups.length} action
                  {profileEntry.groups.length > 1 ? "s" : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderActionsView() {
    return (
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              Profil — {selectedProfile.profile.name}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Choisis une action à lancer.
            </Text>
          </View>

          <Pressable
            onPress={goBackToProfiles}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Retour</Text>
          </Pressable>
        </View>

        {selectedProfile.groups.length === 0 ? (
          <Text style={{ opacity: 0.72 }}>
            Ce profil ne contient encore aucune action.
          </Text>
        ) : (
          <View style={{ gap: 8 }}>
            {selectedProfile.groups.map(({ group, dice }) => (
              <Pressable
                key={group.id}
                onPress={() => openAction(group.id)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 12,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {group.name}
                </Text>

                <Text style={{ opacity: 0.72 }}>
                  {dice.map((die) => `${die.qty}d${die.sides}`).join(" + ") || "Aucun dé"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderResultView() {
    if (!selectedAction) {
      return renderActionsView();
    }

    const { group, dice } = selectedAction;

    return (
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              {selectedProfile.profile.name} — {group.name}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Lance cette action.
            </Text>
          </View>

          <Pressable
            onPress={goBackToActions}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Retour</Text>
          </Pressable>
        </View>

        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Dés de l’action</Text>

          {dice.length === 0 ? (
            <Text style={{ opacity: 0.72 }}>Aucun dé configuré.</Text>
          ) : (
            dice.map((die, index) => (
              <Text key={`${group.id}-${index}`} style={{ opacity: 0.72 }}>
                {die.qty}d{die.sides}
                {die.modifier ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}` : ""}
              </Text>
            ))
          )}
        </View>

        <Pressable
          onPress={() => onRollGroup(selectedProfile.profile.id, group.id)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "800" }}>Lancer</Text>
        </Pressable>

        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Résultat</Text>

          {!selectedActionResult ? (
            <Text style={{ opacity: 0.72 }}>
              Lance l’action pour afficher son résultat ici.
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 40, fontWeight: "900" }}>
                {selectedActionResult.total}
              </Text>

              <Text style={{ opacity: 0.72 }}>
                {selectedActionResult.entries
                  .flatMap((entry) => entry.signed_values)
                  .join(" + ")}
              </Text>

              {selectedActionResult.group_eval_result ? (
                <Text style={{ fontWeight: "700" }}>
                  {formatRuleResult(selectedActionResult.group_eval_result)}
                </Text>
              ) : null}

              {selectedActionResult.entries.some((entry) => entry.eval_result) ? (
                <View style={{ gap: 4, marginTop: 4 }}>
                  {selectedActionResult.entries.map((entry) =>
                    entry.eval_result ? (
                      <Text key={entry.entryId} style={{ opacity: 0.85 }}>
                        {formatRuleResult(entry.eval_result)}
                      </Text>
                    ) : null,
                  )}
                </View>
              ) : null}
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      {viewMode === "profiles" && renderProfilesView()}
      {viewMode === "actions" && renderActionsView()}
      {viewMode === "result" && renderResultView()}
    </View>
  );
}