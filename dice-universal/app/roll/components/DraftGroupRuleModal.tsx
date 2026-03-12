import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  visible: boolean;
  selectedRuleId: string | null;
  pipelineRules: RuleRow[];
  legacyRules: RuleRow[];
  onSelectRule: (ruleId: string | null) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function DraftGroupRuleModal({
  visible,
  selectedRuleId,
  pipelineRules,
  legacyRules,
  onSelectRule,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            maxHeight: "90%",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            Configurer la règle de groupe du draft
          </Text>

          <Pressable
            onPress={() => onSelectRule(null)}
            style={{
              marginTop: 12,
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              opacity: selectedRuleId === null ? 1 : 0.7,
            }}
          >
            <Text style={{ fontWeight: selectedRuleId === null ? "700" : "400" }}>
              Somme (par défaut)
            </Text>
          </Pressable>

          <ScrollView style={{ marginTop: 12, maxHeight: 300 }}>
            <Text style={{ fontWeight: "700" }}>Pipelines</Text>

            {pipelineRules.map((rule) => (
              <Pressable
                key={rule.id}
                onPress={() => onSelectRule(rule.id)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginTop: 8,
                  opacity: selectedRuleId === rule.id ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: selectedRuleId === rule.id ? "700" : "400" }}>
                  {rule.name}
                </Text>
                <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                  {rule.is_system === 1 ? "système" : "perso"}
                </Text>
              </Pressable>
            ))}

            {legacyRules.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                {legacyRules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => onSelectRule(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginTop: 8,
                      opacity: selectedRuleId === rule.id ? 1 : 0.65,
                    }}
                  >
                    <Text style={{ fontWeight: selectedRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                    <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                      type: {rule.kind}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
            <Pressable
              onPress={onCancel}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
            >
              <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}