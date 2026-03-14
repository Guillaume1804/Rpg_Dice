// app/rules/components/RulesListSection.tsx
import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  pipelineRules: RuleRow[];
  legacyRules: RuleRow[];
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
};

export function RulesListSection({
  pipelineRules,
  legacyRules,
  onEditRule,
  onDeleteRule,
}: Props) {
  return (
    <ScrollView style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "700" }}>Pipelines</Text>

      {pipelineRules.map((rule) => (
        <View
          key={rule.id}
          style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
          <Text style={{ opacity: 0.7, marginTop: 4 }}>
            type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
          </Text>

          <Pressable
            disabled={rule.is_system === 1}
            onPress={() => onEditRule(rule)}
            style={{
              marginTop: 8,
              padding: 8,
              borderWidth: 1,
              borderRadius: 8,
              opacity: rule.is_system === 1 ? 0.4 : 1,
            }}
          >
            <Text>Éditer</Text>
          </Pressable>

          {rule.is_system !== 1 ? (
            <Pressable
              onPress={() => onDeleteRule(rule.id)}
              style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 8 }}
            >
              <Text>Supprimer</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {legacyRules.length ? (
        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: "700" }}>Compatibilité (anciens types)</Text>
          <Text style={{ opacity: 0.7, marginTop: 4 }}>
            Ces règles existent encore pour compatibilité.
          </Text>

          {legacyRules.map((rule) => (
            <View
              key={rule.id}
              style={{
                marginTop: 10,
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                opacity: 0.75,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
              <Text style={{ opacity: 0.7, marginTop: 4 }}>
                type: {rule.kind} {rule.is_system === 1 ? "• système" : "• perso"}
              </Text>

              <Pressable
                onPress={() => onEditRule(rule)}
                style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Voir</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}