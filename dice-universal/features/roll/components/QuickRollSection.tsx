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
  function renderDraftGroup(group: DraftGroupState) {
    const groupResult = draftResults.find((r) => r.groupId === group.id);
    const isSelected = selectedDraftGroupId === group.id;

    return (
      <View
        key={group.id}
        style={{
          marginTop: 12,
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "800", fontSize: 15 }}>{group.name}</Text>
          {isSelected ? (
            <Text style={{ opacity: 0.7, fontSize: 12 }}>Sélectionné</Text>
          ) : null}
        </View>

        <Text style={{ marginTop: 4, opacity: 0.75 }}>
          Règle : {getRuleNameFromId(group.rule_id, availableRules)}
        </Text>

        <Text style={{ marginTop: 4, opacity: 0.7 }}>
          {group.dice.length} entrée{group.dice.length > 1 ? "s" : ""}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
          {!isSelected ? (
            <Pressable
              onPress={() => onSelectDraftGroup(group.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text>Utiliser</Text>
            </Pressable>
          ) : null}

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
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>Supprimer</Text>
          </Pressable>
        </View>

        {group.dice.length === 0 ? (
          <Text style={{ marginTop: 8, opacity: 0.7 }}>
            Aucune entrée pour ce groupe.
          </Text>
        ) : (
          group.dice.map((d, index) => (
            <View
              key={`${group.id}-${index}`}
              style={{
                marginTop: 10,
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                Entrée {index + 1} — {d.qty}d{d.sides}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.8 }}>
                Signe : {getSignLabel(d.sign)} | Mod. : {d.modifier ?? 0}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.8 }}>
                Règle : {getRuleNameFromId(d.rule_id, availableRules)}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
                <Pressable
                  onPress={() => onEditDraftDie(group.id, index)}
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
                  onPress={() => onRemoveDraftDie(group.id, index)}
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
          ))
        )}

        {groupResult ? (
          <View
            style={{
              marginTop: 12,
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, opacity: 0.75 }}>Résultat</Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              {groupResult.total}
            </Text>

            <Text style={{ marginTop: 4, opacity: 0.8 }}>
              Somme des entrées : {groupResult.entries_total}
            </Text>

            <Text style={{ marginTop: 4, opacity: 0.8 }}>
              Règle de groupe :{" "}
              {groupResult.group_rule
                ? groupResult.group_rule.name
                : "Somme (par défaut)"}
              {groupResult.group_eval_result
                ? ` → ${formatRuleResult(groupResult.group_eval_result)}`
                : ""}
            </Text>

            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
              {groupResult.entries.map((e) => (
                <View key={e.entryId} style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: "700" }}>
                    {e.qty}d{e.sides} | signe {getSignLabel(e.sign)} | mod {e.modifier}
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
      </View>
    );
  }

  return (
    <View style={{ marginTop: 4, padding: 12, borderWidth: 1, borderRadius: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>Jet libre</Text>

      <Text style={{ marginTop: 4, opacity: 0.75 }}>
        Lance rapidement des dés ou construis une action temporaire.
      </Text>

      <Text style={{ marginTop: 12, fontWeight: "700" }}>Dés rapides</Text>

      <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
        {standardDice.map((s) => (
          <Pressable
            key={s}
            onPress={() => onAddDieToDraft(s)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 8,
              marginRight: 8,
              marginBottom: 8,
              minWidth: 56,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>d{s}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ marginTop: 12, fontWeight: "700" }}>Actions temporaires</Text>

      <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
        <Pressable
          onPress={onAddDraftGroup}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text>+ Nouveau groupe</Text>
        </Pressable>
      </View>

      {draftGroups.length === 0 ? (
        <Text style={{ marginTop: 10, opacity: 0.7 }}>
          Aucun groupe temporaire pour le moment.
        </Text>
      ) : (
        <View style={{ marginTop: 10 }}>{draftGroups.map(renderDraftGroup)}</View>
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14 }}>
        <Pressable
          onPress={onRollDraft}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Lancer</Text>
        </Pressable>

        <Pressable
          onPress={onClearDraft}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text>Vider</Text>
        </Pressable>

        <Pressable
          onPress={onToggleSaveOptions}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text>Enregistrer</Text>
        </Pressable>
      </View>

      {showSaveOptions ? (
        <View style={{ marginTop: 10, gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Sauvegarder ce jet libre</Text>

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
                Table système : remplacement interdit
              </Text>
            ) : null}
          </Pressable>

          <Pressable
            onPress={onCreateNewTable}
            style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
          >
            <Text>Créer une nouvelle table</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}