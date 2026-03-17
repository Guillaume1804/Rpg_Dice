import { useMemo, useState } from "react";
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
  standardDice: number[];
  draftGroups: DraftGroupState[];
  draftResults: GroupRollResult[];
  selectedDraftGroupId: string | null;
  tableIsSystem: boolean;
  showSaveOptions: boolean;
  onToggleSaveOptions: () => void;
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
  standardDice,
  draftGroups,
  draftResults,
  selectedDraftGroupId,
  tableIsSystem,
  showSaveOptions,
  onToggleSaveOptions,
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 14,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Jet rapide</Text>

        <Text style={{ opacity: 0.75 }}>
          Ajoute des dés, lance, puis affine si tu veux une action plus avancée.
        </Text>

        <Text style={{ marginTop: 4, fontWeight: "700" }}>Dés standards</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
          {standardDice.map((s) => (
            <Pressable
              key={s}
              onPress={() => onAddDieToDraft(s)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
                marginRight: 8,
                marginBottom: 8,
                minWidth: 62,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>d{s}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
          <Pressable
            onPress={onRollDraft}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Lancer</Text>
          </Pressable>

          <Pressable
            onPress={onClearDraft}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>Réinitialiser</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowAdvanced((v) => !v)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <Text>{showAdvanced ? "Masquer l’avancé" : "Options avancées"}</Text>
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
        <Text style={{ fontSize: 15, fontWeight: "800" }}>Action en cours</Text>

        {!selectedGroup ? (
          <Text style={{ opacity: 0.7 }}>
            Aucun jet en cours. Ajoute un dé standard pour démarrer.
          </Text>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "800" }}>
                  {selectedGroup.name}
                </Text>

                <Text style={{ marginTop: 4, opacity: 0.75 }}>
                  {selectedGroup.dice.length} entrée
                  {selectedGroup.dice.length > 1 ? "s" : ""} • Règle :{" "}
                  {getRuleNameFromId(selectedGroup.rule_id, availableRules)}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  onRenameDraftGroup(selectedGroup.id, selectedGroup.name)
                }
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text>Renommer</Text>
              </Pressable>
            </View>

            {selectedGroup.dice.length === 0 ? (
              <Text style={{ opacity: 0.7 }}>
                Cette action ne contient encore aucun dé.
              </Text>
            ) : (
              <View style={{ gap: 8 }}>
                {selectedGroup.dice.map((d, index) => (
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
                      {d.qty}d{d.sides}
                    </Text>

                    <Text style={{ opacity: 0.78 }}>
                      Signe : {getSignLabel(d.sign)} • Mod. : {d.modifier ?? 0}
                    </Text>

                    <Text style={{ opacity: 0.78 }}>
                      Règle : {getRuleNameFromId(d.rule_id, availableRules)}
                    </Text>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
                      <Pressable
                        onPress={() => onEditDraftDie(selectedGroup.id, index)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
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
                          marginBottom: 8,
                        }}
                      >
                        <Text>Supprimer</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {selectedGroupResult ? (
        <View
          style={{
            padding: 14,
            borderWidth: 1,
            borderRadius: 14,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, opacity: 0.72 }}>Dernier résultat</Text>

          <Text style={{ fontSize: 30, fontWeight: "900" }}>
            {selectedGroupResult.total}
          </Text>

          <Text style={{ opacity: 0.8 }}>
            Somme des entrées : {selectedGroupResult.entries_total}
          </Text>

          <Text style={{ opacity: 0.8 }}>
            Règle de groupe :{" "}
            {selectedGroupResult.group_rule
              ? selectedGroupResult.group_rule.name
              : "Somme"}
            {selectedGroupResult.group_eval_result
              ? ` → ${formatRuleResult(selectedGroupResult.group_eval_result)}`
              : ""}
          </Text>

          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}>
            {selectedGroupResult.entries.map((e) => (
              <View key={e.entryId} style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "700" }}>
                  {e.qty}d{e.sides} • signe {getSignLabel(e.sign)} • mod {e.modifier}
                </Text>

                <Text style={{ marginTop: 2, opacity: 0.8 }}>
                  Valeurs : [{e.signed_values.join(", ")}]
                </Text>

                <Text style={{ marginTop: 2, opacity: 0.8 }}>
                  Règle : {getRuleName(e.rule)}
                </Text>

                {e.eval_result ? (
                  <Text style={{ marginTop: 2, opacity: 0.85 }}>
                    Résultat règle : {formatRuleResult(e.eval_result)}
                  </Text>
                ) : null}

                <Text style={{ marginTop: 2, fontWeight: "700" }}>
                  Final entrée : {e.final_total}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {showAdvanced ? (
        <View
          style={{
            padding: 14,
            borderWidth: 1,
            borderRadius: 14,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "800" }}>Options avancées</Text>

          <Text style={{ opacity: 0.75 }}>
            Crée plusieurs actions temporaires, choisis laquelle modifier, puis sauvegarde si besoin.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Pressable
              onPress={onAddDraftGroup}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "700" }}>+ Nouvelle action</Text>
            </Pressable>
          </View>

          {draftGroups.length === 0 ? (
            <Text style={{ opacity: 0.7 }}>
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
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "800", fontSize: 15 }}>
                        {group.name}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.75 }}>
                        {group.dice.length} entrée{group.dice.length > 1 ? "s" : ""} • Règle :{" "}
                        {getRuleNameFromId(group.rule_id, availableRules)}
                      </Text>
                    </View>

                    {isSelected ? (
                      <Text style={{ opacity: 0.7, fontSize: 12 }}>Active</Text>
                    ) : (
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
                    )}
                  </View>

                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Pressable
                      onPress={() => onRenameDraftGroup(group.id, group.name)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
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
                        marginRight: 8,
                        marginBottom: 8,
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
                        marginBottom: 8,
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
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: tableIsSystem ? 0.4 : 1,
                }}
              >
                <Text>Remplacer la table actuelle</Text>
                {tableIsSystem ? (
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>
                    Table système : remplacement interdit.
                  </Text>
                ) : null}
              </Pressable>

              <Pressable
                onPress={onCreateNewTable}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
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