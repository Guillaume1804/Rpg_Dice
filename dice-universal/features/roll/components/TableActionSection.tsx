// dice-universal\features\roll\components\TableActionSection.tsx

import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type {
  GroupRow,
  GroupDieRow,
} from "../../../data/repositories/groupsRepo";
import { formatRuleResult, getPipelineDisplayLines } from "../helpers";

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
  activeProfile: ProfileRow | null;

  tableQuickSides: number;
  tableQuickQty: number;
  tableQuickModifier: number;
  tableQuickBehaviorLabel: string | null;
  tableQuickResult: GroupRollResult | null;

  onSelectTableQuickDie: (sides: number) => void;
  onAdjustTableQuickQty: (delta: number) => void;
  onOpenTableQuickBehaviorPicker: () => void;
  onRollTableQuickAction: () => void;
  onSaveQuickRollAsAction: () => void;
};

type TableViewMode = "profiles" | "actions" | "result";

function getGroupResult(
  groupId: string,
  results: GroupRollResult[],
): GroupRollResult | null {
  return results.find((result) => result.groupId === groupId) ?? null;
}

function PipelineResultLines({ result }: { result: any }) {
  const lines = getPipelineDisplayLines(result);

  if (lines.length === 0) {
    return (
      <Text style={{ fontWeight: "700" }}>{formatRuleResult(result)}</Text>
    );
  }

  return (
    <View style={{ gap: 3 }}>
      {lines.map((line, index) => (
        <Text
          key={`pipeline-line-${index}`}
          style={{
            opacity: line.endsWith(":") ? 1 : 0.72,
            fontWeight: line.endsWith(":") ? "800" : "400",
          }}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

export function TableActionSection({
  profiles,
  selectedProfileId,
  results,
  onSelectProfile,
  onRollGroup,
  activeProfile,
  tableQuickSides,
  tableQuickQty,
  tableQuickModifier,
  tableQuickBehaviorLabel,
  tableQuickResult,
  onSelectTableQuickDie,
  onAdjustTableQuickQty,
  onOpenTableQuickBehaviorPicker,
  onRollTableQuickAction,
  onSaveQuickRollAsAction,
}: Props) {
  const [viewMode, setViewMode] = useState<TableViewMode>("profiles");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedProfileEntry = useMemo<ProfileWithGroups | null>(() => {
    return (
      profiles.find((p) => p.profile.id === selectedProfileId) ??
      profiles[0] ??
      null
    );
  }, [profiles, selectedProfileId]);

  const selectedAction = useMemo(() => {
    if (!selectedProfileEntry || !selectedGroupId) return null;

    return (
      selectedProfileEntry.groups.find(
        (entry) => entry.group.id === selectedGroupId,
      ) ?? null
    );
  }, [selectedProfileEntry, selectedGroupId]);

  const selectedActionResult = useMemo(() => {
    if (!selectedGroupId) return null;
    return getGroupResult(selectedGroupId, results);
  }, [selectedGroupId, results]);

  useEffect(() => {
    if (!selectedProfileEntry) {
      setViewMode("profiles");
      setSelectedGroupId(null);
      return;
    }

    if (!selectedAction && viewMode === "result") {
      setViewMode("actions");
    }
  }, [selectedProfileEntry, selectedAction, viewMode]);

  if (!selectedProfileEntry) {
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
    if (!selectedProfileEntry) return null;

    const profileEntry = selectedProfileEntry;

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
              Profil — {profileEntry.profile.name}
            </Text>

            <Text style={{ opacity: 0.72 }}>Choisis une action à lancer.</Text>
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

        {activeProfile ? (
          <View
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              Action rapide du profil
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Profil ciblé : {activeProfile.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                <Pressable
                  key={sides}
                  onPress={() => onSelectTableQuickDie(sides)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: tableQuickSides === sides ? 1 : 0.7,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: tableQuickSides === sides ? "700" : "400",
                    }}
                  >
                    d{sides}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => onAdjustTableQuickQty(-1)}
                style={{
                  width: 36,
                  height: 36,
                  borderWidth: 1,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 18 }}>−</Text>
              </Pressable>

              <View
                style={{
                  minWidth: 64,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>{tableQuickQty}</Text>
              </View>

              <Pressable
                onPress={() => onAdjustTableQuickQty(1)}
                style={{
                  width: 36,
                  height: 36,
                  borderWidth: 1,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 18 }}>+</Text>
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
              <Text style={{ fontWeight: "700" }}>Configuration</Text>

              <Text style={{ opacity: 0.72 }}>
                Jet : {tableQuickQty}d{tableQuickSides}
                {tableQuickModifier !== 0
                  ? ` ${tableQuickModifier > 0 ? "+" : ""}${tableQuickModifier}`
                  : ""}
              </Text>

              <Text style={{ opacity: 0.72 }}>
                Comportement : {tableQuickBehaviorLabel ?? "Somme (par défaut)"}
              </Text>

              <Pressable
                onPress={onOpenTableQuickBehaviorPicker}
                style={{
                  marginTop: 4,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  Choisir un comportement
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Pressable
                onPress={onRollTableQuickAction}
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

              <Pressable
                onPress={onSaveQuickRollAsAction}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "800" }}>Sauvegarder en action</Text>
              </Pressable>
            </View>

            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: "800" }}>Résultat rapide</Text>

              {!tableQuickResult ? (
                <Text style={{ opacity: 0.72 }}>
                  Lance l’action rapide pour afficher son résultat ici.
                </Text>
              ) : (
                <>
                  <Text style={{ fontSize: 22, fontWeight: "800" }}>
                    Total : {tableQuickResult.total}
                  </Text>

                  {tableQuickResult.group_eval_result ? (
                    tableQuickResult.group_eval_result.kind === "pipeline" ? (
                      <PipelineResultLines
                        result={tableQuickResult.group_eval_result}
                      />
                    ) : (
                      <Text style={{ fontWeight: "700" }}>
                        {formatRuleResult(tableQuickResult.group_eval_result)}
                      </Text>
                    )
                  ) : null}

                  <Text style={{ opacity: 0.72 }}>
                    Valeurs :{" "}
                    {tableQuickResult.entries
                      .flatMap((entry) => entry.natural_values)
                      .join(" + ")}
                  </Text>
                </>
              )}
            </View>
          </View>
        ) : null}

        {profileEntry.groups.length === 0 ? (
          <Text style={{ opacity: 0.72 }}>
            Ce profil ne contient encore aucune action.
          </Text>
        ) : (
          <View style={{ gap: 8 }}>
            {profileEntry.groups.map(({ group, dice }) => (
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
                  {dice.map((die) => `${die.qty}d${die.sides}`).join(" + ") ||
                    "Aucun dé"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderResultView() {
    if (!selectedProfileEntry || !selectedAction) {
      return renderActionsView();
    }

    const profileEntry = selectedProfileEntry;
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
              {profileEntry.profile.name} — {group.name}
            </Text>

            <Text style={{ opacity: 0.72 }}>Lance cette action.</Text>
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
                {die.modifier
                  ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                  : ""}
              </Text>
            ))
          )}
        </View>

        <Pressable
          onPress={() => onRollGroup(profileEntry.profile.id, group.id)}
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
            gap: 8,
          }}
        >
          <Text style={{ fontWeight: "800" }}>Résultat</Text>

          {!selectedActionResult ? (
            <Text style={{ opacity: 0.72 }}>
              Lance l’action pour afficher son résultat ici.
            </Text>
          ) : (
            <>
              {selectedActionResult.group_eval_result ? (
                <View
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Résultat de groupe</Text>

                  {selectedActionResult.group_eval_result.kind ===
                  "pipeline" ? (
                    <PipelineResultLines
                      result={selectedActionResult.group_eval_result}
                    />
                  ) : (
                    <Text style={{ fontWeight: "700" }}>
                      {formatRuleResult(selectedActionResult.group_eval_result)}
                    </Text>
                  )}

                  <Text style={{ opacity: 0.72 }}>
                    Valeurs :{" "}
                    {selectedActionResult.entries
                      .flatMap((entry) => entry.natural_values)
                      .join(" + ")}
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    Total du groupe : {selectedActionResult.total}
                  </Text>
                </View>
              ) : null}

              <View style={{ gap: 8 }}>
                {selectedActionResult.entries.map((entry) => (
                  <View
                    key={entry.entryId}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontWeight: "800" }}>
                      {entry.qty}d{entry.sides}
                      {entry.modifier
                        ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`
                        : ""}
                    </Text>

                    <Text style={{ opacity: 0.72 }}>
                      Naturel : {entry.natural_values.join(" + ")}
                    </Text>

                    <Text style={{ opacity: 0.72 }}>
                      Signé : {entry.signed_values.join(" + ")}
                    </Text>

                    <Text style={{ opacity: 0.72 }}>
                      Total entrée : {entry.final_total}
                    </Text>

                    {entry.eval_result ? (
                      entry.eval_result.kind === "pipeline" ? (
                        <PipelineResultLines result={entry.eval_result} />
                      ) : (
                        <Text style={{ fontWeight: "700" }}>
                          {formatRuleResult(entry.eval_result)}
                        </Text>
                      )
                    ) : null}
                  </View>
                ))}
              </View>

              {!selectedActionResult.group_eval_result ? (
                <View
                  style={{
                    paddingTop: 8,
                    borderTopWidth: 1,
                  }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "900" }}>
                    Total : {selectedActionResult.total}
                  </Text>
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
