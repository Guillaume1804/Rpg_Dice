// dice-universal\features\rules\components\RulesListSection.tsx

import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  systemRules: RuleRow[];
  customRules: RuleRow[];
  onEditRule: (rule: RuleRow) => void;
  onDeleteRule: (ruleId: string) => Promise<void>;
};

export function RulesListSection({
  systemRules,
  customRules,
  onEditRule,
  onDeleteRule,
}: Props) {
  return (
    <ScrollView style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "700" }}>Règles système</Text>

      {systemRules.map((rule) => (
        <View
          key={rule.id}
          style={{
            marginTop: 10,
            padding: 12,
            borderWidth: 1,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
          <Text style={{ opacity: 0.7, marginTop: 4 }}>
            type: {rule.kind} • système
          </Text>

          <Pressable
            onPress={() => onEditRule(rule)}
            style={{
              marginTop: 8,
              padding: 8,
              borderWidth: 1,
              borderRadius: 8,
            }}
          >
            <Text>Voir</Text>
          </Pressable>
        </View>
      ))}

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontWeight: "700" }}>Règles personnalisées</Text>

        {customRules.length === 0 ? (
          <Text style={{ opacity: 0.7, marginTop: 6 }}>
            Aucune règle personnalisée pour le moment.
          </Text>
        ) : (
          customRules.map((rule) => (
            <View
              key={rule.id}
              style={{
                marginTop: 10,
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{rule.name}</Text>
              <Text style={{ opacity: 0.7, marginTop: 4 }}>
                type: {rule.kind} • perso
              </Text>

              <Pressable
                onPress={() => onEditRule(rule)}
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text>Éditer</Text>
              </Pressable>

              <Pressable
                onPress={() => onDeleteRule(rule.id)}
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text>Supprimer</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
