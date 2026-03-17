import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import {
  getRuleName,
  getRuleNameFromId,
  getSignLabel,
  formatRuleResult,
} from "../helpers";

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
  onAddDieToDraft: (sides: number) => void;
  onSelectDraftGroup: (groupId: string) => void;
  onRenameDraftGroup: (groupId: string, currentName: string) => void;
  onEditDraftGroupRule: (groupId: string) => void;
  onRemoveDraftGroup: (groupId: string) => void;
  onEditDraftDie: (groupId: string, index: number) => void;
  onRemoveDraftDie: (groupId: string, index: number) => void;
  onRollDraft: () => void;
  onClearDraft: () => void;
  onReplaceCurrentTable: () => void;
  onCreateNewTable: () => void;
  availableRules: RuleRow[];
};

export function QuickRollSection({
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
  onAddDieToDraft,
  onSelectDraftGroup,
  onRenameDraftGroup,
  onEditDraftGroupRule,
  onRemoveDraftGroup,
  onEditDraftDie,
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

  const selectedGroupResult = useMemo(() => {
    if (!selectedGroup) return null;
    return draftResults.find((r) => r.groupId === selectedGroup.id) ?? null;
  }, [draftResults, selectedGroup]);

  const hasDraftContent = draftGroups.some((g) => g.dice.length > 0);

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

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
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

          <Pressable
            onPress={onToggleAdvanced}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {showAdvanced ? "Masquer l’action temporaire" : "Action temporaire"}
            </Text>
          </Pressable>
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
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Sélection en cours</Text>

        {!selectedGroup || selectedGroup.dice.length === 0 ? (
          <Text style={{ opacity: 0.72 }}>
            Aucun dé sélectionné pour le moment.
          </Text>
        ) : (
          <>
            <Text style={{ fontWeight: "700" }}>{selectedGroup.name}</Text>

            {selectedGroup.dice.map((die, index) => (
              <View
                key={`${selectedGroup.id}-${index}`}
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
                  Signe : {getSignLabel(die.sign)} • Mod : {die.modifier ?? 0}
                </Text>

                <Text style={{ opacity: 0.72 }}>
                  Règle : {getRuleNameFromId(die.rule_id, availableRules)}
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
                    onPress={() => onEditDraftDie(selectedGroup.id, index)}
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
                    onPress={() => onRemoveDraftDie(selectedGroup.id, index)}
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
          </>
        )}
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

        {!selectedGroupResult ? (
          <Text style={{ opacity: 0.72 }}>
            Lance un jet pour afficher le résultat ici.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 34, fontWeight: "900" }}>
              {selectedGroupResult.total}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Somme des entrées : {selectedGroupResult.entries_total}
            </Text>

            <Text style={{ opacity: 0.72 }}>
              Règle de groupe :{" "}
              {selectedGroupResult.group_rule
                ? selectedGroupResult.group_rule.name
                : "Somme"}
              {selectedGroupResult.group_eval_result
                ? ` → ${formatRuleResult(selectedGroupResult.group_eval_result)}`
                : ""}
            </Text>

            <View style={{ marginTop: 8, gap: 8 }}>
              {selectedGroupResult.entries.map((entry) => (
                <View
                  key={entry.entryId}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    {entry.qty}d{entry.sides}
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    Valeurs : [{entry.signed_values.join(", ")}]
                  </Text>

                  <Text style={{ opacity: 0.72 }}>
                    Règle : {getRuleName(entry.rule)}
                  </Text>

                  {entry.eval_result ? (
                    <Text style={{ opacity: 0.72 }}>
                      Résultat règle : {formatRuleResult(entry.eval_result)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
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
                        {group.dice.length} entrée{group.dice.length > 1 ? "s" : ""} •
                        Règle : {getRuleNameFromId(group.rule_id, availableRules)}
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