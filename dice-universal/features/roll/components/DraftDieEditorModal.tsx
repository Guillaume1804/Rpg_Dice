// DraftDieEditorModal.tsx 

import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  visible: boolean;
  entryLabel: string | null;
  draftEditSign: "1" | "-1";
  draftEditSides: string;
  draftEditQty: string;
  draftEditModifier: string;
  draftEditRuleId: string | null;
  modernRules: RuleRow[];
  legacyRules: RuleRow[];
  onChangeSign: (value: "1" | "-1") => void;
  onChangeSides: (value: string) => void;
  onChangeQty: (value: string) => void;
  onChangeModifier: (value: string) => void;
  onChangeRuleId: (value: string | null) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function DraftDieEditorModal({
  visible,
  entryLabel,
  draftEditSign,
  draftEditSides,
  draftEditQty,
  draftEditModifier,
  draftEditRuleId,
  modernRules,
  legacyRules,
  onChangeSign,
  onChangeSides,
  onChangeQty,
  onChangeModifier,
  onChangeRuleId,
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
            Configurer l’entrée du draft
          </Text>

          {entryLabel ? <Text style={{ marginTop: 8, opacity: 0.7 }}>Entrée : {entryLabel}</Text> : null}

          <Text style={{ marginTop: 12 }}>Signe</Text>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Pressable
              onPress={() => onChangeSign("1")}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 8,
                opacity: draftEditSign === "1" ? 1 : 0.6,
              }}
            >
              <Text style={{ fontWeight: draftEditSign === "1" ? "700" : "400" }}>+</Text>
            </Pressable>

            <Pressable
              onPress={() => onChangeSign("-1")}
              style={{
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                opacity: draftEditSign === "-1" ? 1 : 0.6,
              }}
            >
              <Text style={{ fontWeight: draftEditSign === "-1" ? "700" : "400" }}>-</Text>
            </Pressable>
          </View>

          <Text style={{ marginTop: 12 }}>Faces</Text>
          <TextInput
            value={draftEditSides}
            onChangeText={onChangeSides}
            placeholder="6"
            keyboardType="numeric"
            style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <Text style={{ marginTop: 12 }}>Quantité</Text>
          <TextInput
            value={draftEditQty}
            onChangeText={onChangeQty}
            placeholder="1"
            keyboardType="numeric"
            style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <Text style={{ marginTop: 12 }}>Modificateur</Text>
          <TextInput
            value={draftEditModifier}
            onChangeText={onChangeModifier}
            placeholder="0"
            keyboardType="numeric"
            style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle</Text>

          <Pressable
            onPress={() => onChangeRuleId(null)}
            style={{
              marginTop: 8,
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              opacity: draftEditRuleId === null ? 1 : 0.7,
            }}
          >
            <Text style={{ fontWeight: draftEditRuleId === null ? "700" : "400" }}>
              Somme (par défaut)
            </Text>
          </Pressable>

          <ScrollView style={{ marginTop: 12, maxHeight: 260 }}>
            <Text style={{ fontWeight: "700" }}>Règles disponibles</Text>
            {modernRules.map((rule) => (
              <Pressable
                key={rule.id}
                onPress={() => onChangeRuleId(rule.id)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginTop: 8,
                  opacity: draftEditRuleId === rule.id ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: draftEditRuleId === rule.id ? "700" : "400" }}>
                  {rule.name}
                </Text>
                <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                  {rule.is_system === 1 ? "système" : "perso"}
                </Text>
              </Pressable>
            ))}

            {legacyRules.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontWeight: "700" }}>Anciennes règles</Text>
                {legacyRules.map((rule) => (
                  <Pressable
                    key={rule.id}
                    onPress={() => onChangeRuleId(rule.id)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginTop: 8,
                      opacity: draftEditRuleId === rule.id ? 1 : 0.65,
                    }}
                  >
                    <Text style={{ fontWeight: draftEditRuleId === rule.id ? "700" : "400" }}>
                      {rule.name}
                    </Text>
                    <Text style={{ marginTop: 2, opacity: 0.7, fontSize: 12 }}>
                      famille : {rule.kind}
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