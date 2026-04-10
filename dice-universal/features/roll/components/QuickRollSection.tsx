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
  onToggleSaveOptions: () => void;
  onToggleAdvanced: () => void;
  onAddDraftGroup: () => void;
  onAddQuickStandardDie: (sides: number) => void;
  onSelectDraftGroup: (groupId: string) => void;
  onRenameDraftGroup: (groupId: string, currentName: string) => void;
  onEditDraftGroupRule: (groupId: string) => void;
  onRemoveDraftGroup: (groupId: string) => void;
  onEditDraftDie: (groupId: string, index: number) => void;
  onEditQuickDieQty: (
    groupId: string,
    index: number,
    currentQty: number,
    currentModifier: number,
  ) => void;
  onAdjustQuickDieQty: (groupId: string, index: number, delta: number) => void;
  onOpenDieConfig: (sides: number) => void;
  onRemoveDraftDie: (groupId: string, index: number) => void;
  onRollDraft: () => void;
  onRollQuickGroup: (groupId: string) => void;
  onClearQuickGroup: (groupId: string) => void;
  onClearDraft: () => void;
  onReplaceCurrentTable: () => void;
  onCreateNewTable: () => void;
  availableRules: RuleRow[];
};

function getDisplayedRuleName(
  die: DraftDie,
  group: DraftGroupState,
  availableRules: RuleRow[],
) {
  if (die.rule_temp?.name) return die.rule_temp.name;
  if (group.rule_temp?.name) return group.rule_temp.name;
  return getRuleNameFromId(
    die.rule_id ?? group.rule_id ?? null,
    availableRules,
  );
}

function isStandardQuickGroup(group: DraftGroupState) {
  return !group.rule_id && !group.rule_temp && group.name === "Jet libre";
}

function getResultForGroup(
  groupId: string,
  draftResults: GroupRollResult[],
): GroupRollResult | null {
  return draftResults.find((result) => result.groupId === groupId) ?? null;
}

function getEntryResultForIndex(result: GroupRollResult | null, index: number) {
  if (!result) return null;
  return result.entries[index] ?? null;
}

function formatValueList(values: number[]) {
  if (!values || values.length === 0) return "—";
  return values.join(" + ");
}

function renderEntryRuleDetails(
  entryResult: GroupRollResult["entries"][number],
) {
  const res = entryResult.eval_result;

  if (!res) {
    return (
      <>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>
          {entryResult.final_total}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          ({formatValueList(entryResult.signed_values)})
        </Text>
      </>
    );
  }

  if (res.kind === "sum") {
    return (
      <>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>{res.total}</Text>

        <Text style={{ opacity: 0.72 }}>
          ({formatValueList(entryResult.signed_values)})
        </Text>
      </>
    );
  }

  if (res.kind === "single_check") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>Naturel : {res.natural}</Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>
          Final : {res.final}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          ({formatValueList(entryResult.signed_values)})
        </Text>
      </>
    );
  }

  if (res.kind === "highest_of_pool") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>
          Jets : {formatValueList(res.natural_values)}
        </Text>

        <Text style={{ opacity: 0.72 }}>Meilleur : {res.kept}</Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>
          Final : {res.final}
        </Text>
      </>
    );
  }

  if (res.kind === "banded_sum") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>
          Valeurs : {formatValueList(entryResult.natural_values)}
        </Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>
          Total : {res.total}
        </Text>
      </>
    );
  }

  if (res.kind === "table_lookup") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>Valeur : {res.value}</Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>{res.label}</Text>
      </>
    );
  }

  if (res.kind === "pipeline") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>
          Valeurs : {formatValueList(res.values)}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Conservés : {formatValueList(res.kept)}
        </Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>

        {res.final != null ? (
          <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>
            Final : {res.final}
          </Text>
        ) : null}
      </>
    );
  }

  if (res.kind === "success_pool") {
    return (
      <>
        <Text style={{ opacity: 0.72 }}>
          Jets : {formatValueList(entryResult.natural_values)}
        </Text>

        <Text style={{ marginTop: 2, fontWeight: "700" }}>
          {formatRuleResult(res)}
        </Text>
      </>
    );
  }

  return (
    <>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>
        {entryResult.final_total}
      </Text>

      <Text style={{ opacity: 0.72 }}>
        ({formatValueList(entryResult.signed_values)})
      </Text>
    </>
  );
}

function renderGroupRuleDetails(result: GroupRollResult) {
  const res = result.group_eval_result;
  if (!res) return null;

  if (res.kind === "success_pool") {
    return (
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
          <Text style={{ fontWeight: "700" }}>{formatRuleResult(res)}</Text>
        </View>

        <Text style={{ opacity: 0.72, marginTop: 6 }}>
          Jets :{" "}
          {result.entries.flatMap((entry) => entry.natural_values).join(" + ")}
        </Text>
      </>
    );
  }

  return (
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
        <Text style={{ fontWeight: "700" }}>{formatRuleResult(res)}</Text>
      </View>

      <Text style={{ opacity: 0.72, marginTop: 6 }}>
        Valeurs :{" "}
        {result.entries.flatMap((entry) => entry.natural_values).join(" + ")}
      </Text>

      <Text style={{ opacity: 0.72 }}>Total : {result.total}</Text>
    </>
  );
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
  onAdjustQuickDieQty,
  onOpenDieConfig,
  onRemoveDraftDie,
  onRollDraft,
  onRollQuickGroup,
  onClearQuickGroup,
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

  const standardQuickGroup = useMemo(
    () => draftGroups.find((group) => isStandardQuickGroup(group)) ?? null,
    [draftGroups],
  );

  const configuredQuickGroups = useMemo(
    () => draftGroups.filter((group) => !isStandardQuickGroup(group)),
    [draftGroups],
  );

  const standardQuickGroupResult = useMemo(
    () =>
      standardQuickGroup
        ? getResultForGroup(standardQuickGroup.id, draftResults)
        : null,
    [standardQuickGroup, draftResults],
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

        {standardQuickGroup ? (
          <View
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 14,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>Jet libre</Text>

            {standardQuickGroup.dice.length === 0 ? (
              <Text style={{ opacity: 0.72 }}>
                Aucun dé standard sélectionné.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {standardQuickGroup.dice.map((die, index) => {
                  const entryResult = getEntryResultForIndex(
                    standardQuickGroupResult,
                    index,
                  );

                  return (
                    <View
                      key={`${standardQuickGroup.id}-${index}`}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 12,
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <Pressable
                          onPress={() =>
                            onEditQuickDieQty(
                              standardQuickGroup.id,
                              index,
                              die.qty,
                              die.modifier ?? 0,
                            )
                          }
                          style={{ flex: 1 }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {die.qty}d{die.sides}
                            {die.modifier
                              ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                              : ""}
                          </Text>
                        </Pressable>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Pressable
                            onPress={() =>
                              onAdjustQuickDieQty(
                                standardQuickGroup.id,
                                index,
                                -1,
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderWidth: 1,
                              borderRadius: 999,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontWeight: "800" }}>−</Text>
                          </Pressable>

                          <Pressable
                            onPress={() =>
                              onAdjustQuickDieQty(
                                standardQuickGroup.id,
                                index,
                                1,
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderWidth: 1,
                              borderRadius: 999,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontWeight: "800" }}>+</Text>
                          </Pressable>
                        </View>
                      </View>

                      {entryResult ? (
                        <View style={{ paddingTop: 6, borderTopWidth: 1 }}>
                          <Text style={{ fontSize: 20, fontWeight: "800" }}>
                            {entryResult.final_total}
                          </Text>

                          <Text style={{ opacity: 0.72 }}>
                            ({formatValueList(entryResult.signed_values)})
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => onRollQuickGroup(standardQuickGroup.id)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "800" }}>Lancer</Text>
              </Pressable>

              <Pressable
                onPress={() => onClearQuickGroup(standardQuickGroup.id)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Reset</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {configuredQuickGroups.map((group) => {
          const groupResult = getResultForGroup(group.id, draftResults);

          return (
            <View
              key={group.id}
              style={{
                padding: 14,
                borderWidth: 1,
                borderRadius: 14,
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800" }}>
                {group.name}
              </Text>

              {group.dice.map((die, index) => {
                const entryResult = getEntryResultForIndex(groupResult, index);

                return (
                  <View
                    key={`${group.id}-${index}`}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          onEditQuickDieQty(
                            group.id,
                            index,
                            die.qty,
                            die.modifier ?? 0,
                          )
                        }
                        style={{ flex: 1 }}
                      >
                        <Text style={{ fontWeight: "700" }}>
                          {die.qty}d{die.sides}
                          {die.modifier
                            ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                            : ""}
                          {die.rule_temp || group.rule_temp ? " ⚙️" : ""}
                        </Text>

                        <Text style={{ marginTop: 2, opacity: 0.72 }}>
                          {getDisplayedRuleName(die, group, availableRules)}
                        </Text>
                      </Pressable>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                          onPress={() => onAdjustQuickDieQty(group.id, index, -1)}
                          style={{
                            width: 32,
                            height: 32,
                            borderWidth: 1,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontWeight: "800" }}>−</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onAdjustQuickDieQty(group.id, index, 1)}
                          style={{
                            width: 32,
                            height: 32,
                            borderWidth: 1,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontWeight: "800" }}>+</Text>
                        </Pressable>
                      </View>
                    </View>

                    {groupResult?.group_eval_result && index === 0 ? (
                      <View style={{ paddingTop: 6, borderTopWidth: 1 }}>
                        {renderGroupRuleDetails(groupResult)}
                      </View>
                    ) : entryResult ? (
                      <View style={{ paddingTop: 6, borderTopWidth: 1 }}>
                        {renderEntryRuleDetails(entryResult)}
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Pressable
                  onPress={() => onRollQuickGroup(group.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Lancer</Text>
                </Pressable>

                <Pressable
                  onPress={() => onClearQuickGroup(group.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>Reset</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

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
                          {group.rule_temp?.name ??
                            getRuleNameFromId(group.rule_id, availableRules)}
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
                              {getDisplayedRuleName(die, group, availableRules)}
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
                                onPress={() => onRemoveDraftDie(group.id, index)}
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