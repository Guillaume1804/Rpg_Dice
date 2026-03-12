import { View, Text, Pressable } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getRuleName, getRuleNameFromId, getSignLabel, formatRuleResult } from "../helpers";

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
          marginTop: 10,
          padding: 10,
          borderWidth: 1,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {group.name} {isSelected ? "• sélectionné" : ""}
        </Text>

        <Text style={{ marginTop: 4, opacity: 0.8 }}>
          règle de groupe : {getRuleNameFromId(group.rule_id, availableRules)}
        </Text>

        <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => onSelectDraftGroup(group.id)}
            style={{
              padding: 8,
              borderWidth: 1,
              borderRadius: 8,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>Sélectionner</Text>
          </Pressable>

          <Pressable
            onPress={() => onRenameDraftGroup(group.id, group.name)}
            style={{
              padding: 8,
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
              padding: 8,
              borderWidth: 1,
              borderRadius: 8,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>Règle groupe</Text>
          </Pressable>

          <Pressable
            onPress={() => onRemoveDraftGroup(group.id)}
            style={{
              padding: 8,
              borderWidth: 1,
              borderRadius: 8,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>Supprimer groupe</Text>
          </Pressable>
        </View>

        {group.dice.length === 0 ? (
          <Text style={{ marginTop: 8, opacity: 0.7 }}>Aucune entrée.</Text>
        ) : (
          group.dice.map((d, index) => (
            <View
              key={`${group.id}-${index}`}
              style={{
                marginTop: 8,
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                Entrée #{index + 1} — {d.qty}d{d.sides}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.8 }}>
                signe : {getSignLabel(d.sign)} | mod : {d.modifier ?? 0}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.8 }}>
                règle : {getRuleNameFromId(d.rule_id, availableRules)}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => onEditDraftDie(group.id, index)}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                >
                  <Text>Configurer</Text>
                </Pressable>

                <Pressable
                  onPress={() => onRemoveDraftDie(group.id, index)}
                  style={{ padding: 8, borderWidth: 1, borderRadius: 8 }}
                >
                  <Text>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {groupResult ? (
          <View style={{ marginTop: 10 }}>
            {groupResult.entries.map((e) => (
              <View
                key={e.entryId}
                style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {e.qty}d{e.sides} | signe {getSignLabel(e.sign)} | mod {e.modifier}
                </Text>

                <Text style={{ marginTop: 4, opacity: 0.8 }}>
                  valeurs : [{e.signed_values.join(", ")}]
                </Text>

                <Text style={{ marginTop: 4, opacity: 0.8 }}>
                  règle : {getRuleName(e.rule)}
                </Text>

                {e.eval_result ? (
                  <Text style={{ marginTop: 4, opacity: 0.9 }}>
                    résultat règle : {formatRuleResult(e.eval_result)}
                  </Text>
                ) : null}

                <Text style={{ marginTop: 4, fontWeight: "700" }}>
                  entrée = {e.final_total}
                </Text>
              </View>
            ))}

            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
              <Text style={{ opacity: 0.8 }}>
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
            </View>

            <Text style={{ marginTop: 10, fontWeight: "900" }}>
              Total groupe : {groupResult.total}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderRadius: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>Jet rapide</Text>

      <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
        <Pressable
          onPress={onAddDraftGroup}
          style={{
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text>+ Groupe</Text>
        </Pressable>

        {standardDice.map((s) => (
          <Pressable
            key={s}
            onPress={() => onAddDieToDraft(s)}
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text>d{s}</Text>
          </Pressable>
        ))}
      </View>

      {draftGroups.length === 0 ? (
        <Text style={{ marginTop: 10, opacity: 0.7 }}>Draft : —</Text>
      ) : (
        <View style={{ marginTop: 10 }}>{draftGroups.map(renderDraftGroup)}</View>
      )}

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <Pressable
          onPress={onRollDraft}
          style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
        >
          <Text>Lancer draft</Text>
        </Pressable>

        <Pressable
          onPress={onClearDraft}
          style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
        >
          <Text>Reset</Text>
        </Pressable>

        <Pressable
          onPress={onToggleSaveOptions}
          style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginLeft: 10 }}
        >
          <Text>Enregistrer</Text>
        </Pressable>
      </View>

      {showSaveOptions ? (
        <View style={{ marginTop: 10, gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Enregistrer le draft</Text>

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