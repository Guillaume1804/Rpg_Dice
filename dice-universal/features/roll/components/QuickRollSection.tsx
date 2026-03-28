// QuickRollSection.tsx
import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getRuleNameFromId, formatRuleResult } from "../helpers";

type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
  rule_temp?: {
    id: string;
    name: string;
    kind: string;
    params_json: string;
  } | null;
};

type DraftGroupState = {
  id: string;
  name: string;
  rule_id?: string | null;
  rule_temp?: {
    id: string;
    name: string;
    kind: string;
    params_json: string;
  } | null;
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
  onAddQuickStandardDie: (sides: number) => void;
  onSelectDraftGroup: (groupId: string) => void;
  onRenameDraftGroup: (groupId: string, currentName: string) => void;
  onEditDraftGroupRule: (groupId: string) => void;
  onRemoveDraftGroup: (groupId: string) => void;
  onEditDraftDie: (groupId: string, index: number) => void;
  onEditQuickDieQty: (groupId: string, index: number, currentQty: number) => void;
  onOpenDieConfig: (sides: number) => void;
  onRemoveDraftDie: (groupId: string, index: number) => void;
  onRollDraft: () => void;
  onClearDraft: () => void;
  onReplaceCurrentTable: () => void;
  onCreateNewTable: () => void;
  availableRules: RuleRow[];
};

function getGroupDisplayValues(result: GroupRollResult): number[] {
  return result.entries.flatMap((entry) => entry.signed_values);
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
  onAddQuickStandardDie,
  onSelectDraftGroup,
  onRenameDraftGroup,
  onEditDraftGroupRule,
  onRemoveDraftGroup,
  onEditDraftDie,
  onEditQuickDieQty,
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>{title}</Text>
          </View>

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
                onPress={() => onAddQuickStandardDie(sides)}
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

          {draftGroups.some((group) => group.dice.length > 0) ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 4,
              }}
            >
              {draftGroups.flatMap((group) =>
                group.dice.map((die, index) => (
                  <Pressable
                    key={`${group.id}-${index}`}
                    onPress={() => onEditQuickDieQty(group.id, index, die.qty)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {die.qty}d{die.sides} {die.rule_temp || group.rule_temp ? "⚙️" : ""}
                    </Text>
                  </Pressable>
                )),
              )}
            </View>
          ) : (
            <Text style={{ opacity: 0.72 }}>
              Aucun dé sélectionné.
            </Text>
          )}

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

          {draftResults.length === 0 ? (
            <Text style={{ opacity: 0.72 }}>
              Lance un jet pour afficher le résultat ici.
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              {draftResults.map((result) => {
                const values = getGroupDisplayValues(result);
                const hasGroupEval = !!result.group_eval_result;
                const hasEntryEval = result.entries.some((entry) => !!entry.eval_result);
                const hasOnlyStandardEntries = !hasGroupEval && !hasEntryEval;

                return (
                  <View
                    key={result.groupId}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderRadius: 12,
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontWeight: "800" }}>{result.label}</Text>

                    {hasGroupEval ? (
                      <>
                        <View
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {formatRuleResult(result.group_eval_result!)}
                          </Text>
                        </View>

                        <Text style={{ opacity: 0.72 }}>
                          Valeurs : ({values.join(" + ")})
                        </Text>
                      </>
                    ) : hasEntryEval ? (
                      <View style={{ gap: 8 }}>
                        {result.entries.map((entry, index) => {
                          const valueText =
                            entry.signed_values.length === 1
                              ? `${entry.signed_values[0]}`
                              : entry.signed_values.join(" + ");

                          return (
                            <View
                              key={entry.entryId}
                              style={{
                                paddingVertical: 6,
                                borderBottomWidth:
                                  index === result.entries.length - 1 ? 0 : 1,
                              }}
                            >
                              {entry.eval_result ? (
                                <>
                                  <Text style={{ fontSize: 20, fontWeight: "800" }}>
                                    {valueText}
                                  </Text>
                                  <Text
                                    style={{
                                      marginTop: 2,
                                      opacity: 0.85,
                                      fontWeight: "700",
                                    }}
                                  >
                                    {formatRuleResult(entry.eval_result)}
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Text style={{ fontSize: 20, fontWeight: "800" }}>
                                    {entry.final_total}
                                  </Text>
                                  <Text style={{ marginTop: 2, opacity: 0.72 }}>
                                    ({valueText})
                                  </Text>
                                </>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : hasOnlyStandardEntries ? (
                      <>
                        <Text style={{ fontSize: 32, fontWeight: "900" }}>
                          {result.total}
                        </Text>

                        <Text style={{ opacity: 0.72 }}>
                          ({values.join(" + ")})
                        </Text>
                      </>
                    ) : null}
                  </View>
                );
              })}

              {quickModifier !== 0 ? (
                <Text style={{ opacity: 0.72 }}>
                  Modificateur global : {quickModifier > 0 ? "+" : ""}
                  {quickModifier}
                </Text>
              ) : null}
            </View>
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
              onPress={() => onAddQuickStandardDie(sides)}
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
