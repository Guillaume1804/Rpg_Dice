import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { GroupRollResult, EntryRollResult } from "../../../core/roll/roll";
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

function renderSignedValues(values: number[]) {
  if (values.length === 0) return "—";
  return values.join(" + ");
}

function renderNaturalValues(values: number[]) {
  if (values.length === 0) return "—";
  return values.join(" + ");
}

function renderEntryResult(entry: EntryRollResult) {
  if (!entry.eval_result) {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ fontSize: 22, fontWeight: "900" }}>
          {entry.final_total}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          ({renderSignedValues(entry.signed_values)})
          {entry.modifier
            ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`
            : ""}
        </Text>
      </View>
    );
  }

  const res = entry.eval_result;

  if (res.kind === "single_check") {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Naturel : {res.natural}
        </Text>

        <Text style={{ fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 22, fontWeight: "900" }}>
          Final : {res.final}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          ({renderSignedValues(entry.signed_values)})
          {entry.modifier
            ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`
            : ""}
        </Text>
      </View>
    );
  }

  if (res.kind === "highest_of_pool") {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Dés lancés : {renderNaturalValues(res.natural_values)}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Meilleur gardé : {res.kept}
        </Text>

        <Text style={{ fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 22, fontWeight: "900" }}>
          Final : {res.final}
        </Text>
      </View>
    );
  }

  if (res.kind === "banded_sum") {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Valeurs : {renderSignedValues(entry.signed_values)}
        </Text>

        <Text style={{ fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 22, fontWeight: "900" }}>
          Total : {res.total}
        </Text>
      </View>
    );
  }

  if (res.kind === "table_lookup") {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Valeur : {res.value}
        </Text>

        <Text style={{ fontWeight: "700" }}>{res.label}</Text>
      </View>
    );
  }

  if (res.kind === "pipeline") {
    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {entry.qty}d{entry.sides}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Dés lancés : {renderNaturalValues(res.values)}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Conservés : {renderNaturalValues(res.kept)}
        </Text>

        <Text style={{ fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        {res.final != null ? (
          <Text style={{ fontSize: 22, fontWeight: "900" }}>
            Final : {res.final}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        gap: 4,
      }}
    >
      <Text style={{ fontWeight: "800" }}>
        {entry.qty}d{entry.sides}
      </Text>

      <Text style={{ fontWeight: "700" }}>
        {formatRuleResult(res)}
      </Text>
    </View>
  );
}

function renderGroupResult(result: GroupRollResult) {
  if (result.group_eval_result) {
    const res = result.group_eval_result;

    if (res.kind === "success_pool") {
      return (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Résultat de groupe</Text>

          <Text style={{ fontWeight: "700" }}>
            {formatRuleResult(res)}
          </Text>

          <Text style={{ opacity: 0.72 }}>
            Valeurs : {result.entries
              .flatMap((entry) => entry.natural_values)
              .join(" + ")}
          </Text>
        </View>
      );
    }

    if (res.kind === "pipeline") {
      return (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Résultat de groupe</Text>

          <Text style={{ fontWeight: "700" }}>
            {formatRuleResult(res)}
          </Text>

          <Text style={{ opacity: 0.72 }}>
            Dés lancés : {renderNaturalValues(res.values)}
          </Text>

          <Text style={{ opacity: 0.72 }}>
            Conservés : {renderNaturalValues(res.kept)}
          </Text>

          {res.final != null ? (
            <Text style={{ fontSize: 22, fontWeight: "900" }}>
              Final : {res.final}
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 6,
        }}
      >
        <Text style={{ fontWeight: "800" }}>Résultat de groupe</Text>
        <Text style={{ fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        gap: 6,
      }}
    >
      <Text style={{ fontWeight: "800" }}>Résultat global</Text>

      <Text style={{ fontSize: 32, fontWeight: "900" }}>
        {result.total}
      </Text>

      <Text style={{ opacity: 0.72 }}>
        Valeurs : {result.entries.flatMap((entry) => entry.signed_values).join(" + ")}
      </Text>
    </View>
  );
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

        {!selectedActionResult ? (
          <View
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Résultat</Text>
            <Text style={{ opacity: 0.72 }}>
              Lance l’action pour afficher son résultat ici.
            </Text>
          </View>
        ) : (
          <>
            {renderGroupResult(selectedActionResult)}

            <View style={{ gap: 8 }}>
              {selectedActionResult.entries.map((entry) => (
                <View key={entry.entryId}>
                  {renderEntryResult(entry)}
                </View>
              ))}
            </View>
          </>
        )}
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