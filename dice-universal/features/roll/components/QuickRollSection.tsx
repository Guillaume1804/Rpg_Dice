import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getRuleNameFromId } from "../helpers";

type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
};

type DraftGroupState = {
  id: string;
  name: string;
  rule_id?: string | null;
  dice: DraftDie[];
};

type QuickRollSectionProps = {
  simplified?: boolean;
  title: string;
  standardDice: number[];
  draftGroups: DraftGroupState[];
  draftResults: GroupRollResult[];
  selectedDraftGroupId: string | null;
  tableIsSystem: boolean;
  showSaveOptions: boolean;
  showAdvanced: boolean;
  quickModifier: number;
  onIncreaseModifier: () => void;
  onDecreaseModifier: () => void;
  onToggleSaveOptions: () => void;
  onToggleAdvanced: () => void;
  onAddDraftGroup: () => void;
  onAddDieToDraft: (sides: number) => void;
  onSelectDraftGroup: (groupId: string) => void;
  onRenameDraftGroup: (groupId: string, currentName: string) => void;
  onEditDraftGroupRule: (groupId: string) => void;
  onRemoveDraftGroup: (groupId: string) => void;
  onEditDraftDie: (groupId: string, index: number) => void;
  onOpenDieConfig: (sides: number) => void;
  onRemoveDraftDie: (groupId: string, index: number) => void;
  onRollDraft: () => void;
  onClearDraft: () => void;
  onReplaceCurrentTable: () => void;
  onCreateNewTable: () => void;
  availableRules: RuleRow[];
};

function buildDiceSummary(
  draftGroups: DraftGroupState[],
  quickModifier: number = 0,
) {
  const flatDice = draftGroups.flatMap((group) => group.dice);

  if (flatDice.length === 0) return "Aucun dé sélectionné";

  const aggregation = new Map<string, number>();

  for (const die of flatDice) {
    const key = `${die.sides}`;
    const current = aggregation.get(key) ?? 0;
    aggregation.set(key, current + (die.qty ?? 1));
  }

  const diceSummary = Array.from(aggregation.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([sides, qty]) => `${qty}d${sides}`)
    .join(" + ");

  if (quickModifier === 0) {
    return diceSummary;
  }

  return `${diceSummary} ${quickModifier > 0 ? "+" : "-"} ${Math.abs(quickModifier)}`;
}

export function QuickRollSection({
  simplified = false,
  title,
  standardDice,
  draftGroups,
  draftResults,
  selectedDraftGroupId,
  tableIsSystem,
  showSaveOptions,
  showAdvanced,
  quickModifier,
  onIncreaseModifier,
  onDecreaseModifier,
  onToggleSaveOptions,
  onToggleAdvanced,
  onAddDraftGroup,
  onAddDieToDraft,
  onSelectDraftGroup,
  onRenameDraftGroup,
  onEditDraftGroupRule,
  onRemoveDraftGroup,
  onEditDraftDie,
  onOpenDieConfig,
  onRemoveDraftDie,
  onRollDraft,
  onClearDraft,
  onReplaceCurrentTable,
  onCreateNewTable,
  availableRules,
}: QuickRollSectionProps) {
  const selectedGroup = useMemo(() => {
    if (draftGroups.length === 0) return null;

    return (
      draftGroups.find((g) => g.id === selectedDraftGroupId) ??
      draftGroups[0] ??
      null
    );
  }, [draftGroups, selectedDraftGroupId]);

  const hasDraftContent = useMemo(
    () => draftGroups.some((group) => group.dice.length > 0),
    [draftGroups],
  );

  const selectionSummary = useMemo(
    () => buildDiceSummary(draftGroups, quickModifier),
    [draftGroups, quickModifier],
  );

  const aggregatedResult = useMemo(() => {
    if (draftResults.length === 0) return null;

    const baseTotal = draftResults.reduce(
      (sum, result) => sum + result.total,
      0,
    );

    const allValues = draftResults.flatMap((result) =>
      result.entries.flatMap((entry) => entry.signed_values),
    );

    return {
      baseTotal,
      total: baseTotal + quickModifier,
      values: allValues,
      modifier: quickModifier,
    };
  }, [draftResults, quickModifier]);

  if (simplified) {
    return (
      <View style={{ marginTop: 12, gap: 12 }}>
        <View
          style={{
            padding: 14,
            borderWidth: 1,
            borderRadius: 14,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800" }}>{title}</Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {standardDice.map((sides) => (
              <Pressable
                key={sides}
                onPress={() => onAddDieToDraft(sides)}
                onLongPress={() => onOpenDieConfig(sides)}
                delayLongPress={300}
                style={{
                  minWidth: 64,
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 16 }}>
                  d{sides}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={{
            padding: 14,
            borderWidth: 1,
            borderRadius: 14,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800" }}>
            Sélection actuelle
          </Text>

          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            {selectionSummary}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Modificateur :</Text>

            <Pressable
              onPress={onDecreaseModifier}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "800" }}>−</Text>
            </Pressable>

            <View
              style={{
                minWidth: 52,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>
                {quickModifier >= 0 ? `+${quickModifier}` : quickModifier}
              </Text>
            </View>

            <Pressable
              onPress={onIncreaseModifier}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "800" }}>+</Text>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Pressable
              onPress={onRollDraft}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "800" }}>Lancer</Text>
            </Pressable>

            {hasDraftContent ? (
              <Pressable
                onPress={onClearDraft}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Reset</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View
          style={{
            padding: 14,
            borderWidth: 1,
            borderRadius: 14,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800" }}>Résultat</Text>

          {!aggregatedResult ? (
            <Text style={{ opacity: 0.72 }}>
              Lance un jet pour afficher le résultat ici.
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 40, fontWeight: "900" }}>
                {aggregatedResult.total}
              </Text>

              <Text style={{ opacity: 0.72 }}>
                {aggregatedResult.values.length > 0
                  ? `(${aggregatedResult.values.join(" + ")})`
                  : "Aucune valeur détaillée"}
              </Text>

              {aggregatedResult.modifier !== 0 ? (
                <Text style={{ opacity: 0.72 }}>
                  Modificateur global :{" "}
                  {aggregatedResult.modifier > 0 ? "+" : ""}
                  {aggregatedResult.modifier}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {showAdvanced ? (
          <View
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              Action temporaire
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Pressable
                onPress={onAddDraftGroup}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>+ Nouvelle action</Text>
              </Pressable>
            </View>

            {draftGroups.length === 0 ? (
              <Text style={{ opacity: 0.72 }}>
                Aucune action temporaire pour le moment.
              </Text>
            ) : (
              draftGroups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;

                return (
                  <View
                    key={group.id}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 12,
                      gap: 8,
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
                        <Text style={{ fontWeight: "800" }}>{group.name}</Text>

                        <Text style={{ marginTop: 4, opacity: 0.72 }}>
                          {group.dice.length} entrée
                          {group.dice.length > 1 ? "s" : ""} • Règle :{" "}
                          {getRuleNameFromId(group.rule_id, availableRules)}
                        </Text>
                      </View>

                      {!isSelected ? (
                        <Pressable
                          onPress={() => onSelectDraftGroup(group.id)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 8,
                          }}
                        >
                          <Text>Utiliser</Text>
                        </Pressable>
                      ) : (
                        <Text style={{ opacity: 0.72 }}>Active</Text>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <Pressable
                        onPress={() => onRenameDraftGroup(group.id, group.name)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Renommer</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onEditDraftGroupRule(group.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Règle</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onRemoveDraftGroup(group.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Supprimer</Text>
                      </Pressable>
                    </View>

                    {group.dice.length > 0 ? (
                      <View style={{ gap: 8, marginTop: 4 }}>
                        {group.dice.map((die, index) => (
                          <View
                            key={`${group.id}-${index}`}
                            style={{
                              padding: 10,
                              borderWidth: 1,
                              borderRadius: 10,
                              gap: 4,
                            }}
                          >
                            <Text style={{ fontWeight: "700" }}>
                              {die.qty}d{die.sides}
                            </Text>

                            <Text style={{ opacity: 0.72 }}>
                              Mod : {die.modifier ?? 0}
                            </Text>

                            <Text style={{ opacity: 0.72 }}>
                              Règle :{" "}
                              {getRuleNameFromId(die.rule_id, availableRules)}
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                                marginTop: 4,
                              }}
                            >
                              <Pressable
                                onPress={() => onEditDraftDie(group.id, index)}
                                style={{
                                  paddingVertical: 8,
                                  paddingHorizontal: 10,
                                  borderWidth: 1,
                                  borderRadius: 8,
                                }}
                              >
                                <Text>Modifier</Text>
                              </Pressable>

                              <Pressable
                                onPress={() =>
                                  onRemoveDraftDie(group.id, index)
                                }
                                style={{
                                  paddingVertical: 8,
                                  paddingHorizontal: 10,
                                  borderWidth: 1,
                                  borderRadius: 8,
                                }}
                              >
                                <Text>Supprimer</Text>
                              </Pressable>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}

            <Pressable
              onPress={onToggleSaveOptions}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>Sauvegarder ce jet</Text>
            </Pressable>

            {showSaveOptions ? (
              <View style={{ gap: 8 }}>
                <Pressable
                  onPress={onReplaceCurrentTable}
                  disabled={tableIsSystem}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: tableIsSystem ? 0.4 : 1,
                  }}
                >
                  <Text>Remplacer la table actuelle</Text>
                </Pressable>

                <Pressable
                  onPress={onCreateNewTable}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text>Créer une nouvelle table</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>{title}</Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {standardDice.map((sides) => (
            <Pressable
              key={sides}
              onPress={() => onAddDieToDraft(sides)}
              style={{
                minWidth: 64,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>d{sides}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
