import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  systemRules: RuleRow[];
  customRules: RuleRow[];
  legacyRules: RuleRow[];
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
};

function renderRuleKindLabel(kind: string) {
  if (kind === "single_check") return "Test simple";
  if (kind === "success_pool") return "Pool de succès";
  if (kind === "table_lookup") return "Table d’intervalles";
  if (kind === "banded_sum") return "Somme à bandes";
  if (kind === "highest_of_pool") return "Meilleur dé";
  if (kind === "pipeline") return "Pipeline avancé";
  if (kind === "sum") return "Somme";
  return kind;
}

function RuleCard({
  rule,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  rule: RuleRow;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <View
      style={{
        marginTop: 10,
        padding: 12,
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontWeight: "700" }}>{rule.name}</Text>

      <Text style={{ opacity: 0.7, marginTop: 4 }}>
        Famille : {renderRuleKindLabel(rule.kind)}
      </Text>

      <Text style={{ opacity: 0.7, marginTop: 2 }}>
        {rule.is_system === 1 ? "Règle système" : "Règle personnalisée"}
      </Text>

      <Pressable
        disabled={!canEdit}
        onPress={onEdit}
        style={{
          marginTop: 8,
          padding: 8,
          borderWidth: 1,
          borderRadius: 8,
          opacity: canEdit ? 1 : 0.4,
        }}
      >
        <Text>{canEdit ? "Modifier" : "Lecture seule"}</Text>
      </Pressable>

      {canDelete ? (
        <Pressable
          onPress={onDelete}
          style={{
            marginTop: 8,
            padding: 8,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text>Supprimer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function RulesListSection({
  systemRules,
  customRules,
  legacyRules,
  onEditRule,
  onDeleteRule,
}: Props) {
  return (
    <ScrollView style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 16 }}>Règles personnalisées</Text>

      {customRules.length === 0 ? (
        <Text style={{ opacity: 0.7, marginTop: 8 }}>
          Aucune règle personnalisée pour le moment.
        </Text>
      ) : (
        customRules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            canEdit={true}
            canDelete={true}
            onEdit={() => onEditRule(rule)}
            onDelete={() => onDeleteRule(rule.id)}
          />
        ))
      )}

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Règles système</Text>

        {systemRules.length === 0 ? (
          <Text style={{ opacity: 0.7, marginTop: 8 }}>
            Aucune règle système trouvée.
          </Text>
        ) : (
          systemRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              canEdit={false}
              canDelete={false}
              onEdit={() => onEditRule(rule)}
              onDelete={async () => {}}
            />
          ))
        )}
      </View>

      {legacyRules.length > 0 ? (
        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>
            Compatibilité ancienne logique
          </Text>

          <Text style={{ opacity: 0.7, marginTop: 4 }}>
            Ces règles existent encore pour compatibilité technique.
          </Text>

          {legacyRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              canEdit={false}
              canDelete={false}
              onEdit={() => onEditRule(rule)}
              onDelete={async () => {}}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}