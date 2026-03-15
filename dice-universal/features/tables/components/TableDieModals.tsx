import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  showCreateDieModal: boolean;
  targetGroupForNewDie: GroupRow | null;
  newDieSides: string;
  newDieQty: string;
  newDieModifier: string;
  newDieSign: "1" | "-1";
  newDieRuleId: string | null;
  pipelineRules: RuleRow[];
  legacyRules: RuleRow[];
  onChangeNewDieSides: (value: string) => void;
  onChangeNewDieQty: (value: string) => void;
  onChangeNewDieModifier: (value: string) => void;
  onChangeNewDieSign: (value: "1" | "-1") => void;
  onChangeNewDieRuleId: (value: string | null) => void;
  onCloseCreateDieModal: () => void;
  onSubmitCreateDie: () => void | Promise<void>;

  editingDie: GroupDieRow | null;
  editDieSides: string;
  editDieQty: string;
  editDieModifier: string;
  editDieSign: "1" | "-1";
  selectedRuleId: string | null;
  onChangeEditDieSides: (value: string) => void;
  onChangeEditDieQty: (value: string) => void;
  onChangeEditDieModifier: (value: string) => void;
  onChangeEditDieSign: (value: "1" | "-1") => void;
  onChangeSelectedRuleId: (value: string | null) => void;
  onCloseEditDieModal: () => void;
  onSubmitEditDie: () => void | Promise<void>;
};

export function TableDieModals({
  showCreateDieModal,
  targetGroupForNewDie,
  newDieSides,
  newDieQty,
  newDieModifier,
  newDieSign,
  newDieRuleId,
  pipelineRules,
  legacyRules,
  onChangeNewDieSides,
  onChangeNewDieQty,
  onChangeNewDieModifier,
  onChangeNewDieSign,
  onChangeNewDieRuleId,
  onCloseCreateDieModal,
  onSubmitCreateDie,
  editingDie,
  editDieSides,
  editDieQty,
  editDieModifier,
  editDieSign,
  selectedRuleId,
  onChangeEditDieSides,
  onChangeEditDieQty,
  onChangeEditDieModifier,
  onChangeEditDieSign,
  onChangeSelectedRuleId,
  onCloseEditDieModal,
  onSubmitEditDie,
}: Props) {
  return (
    <>
      <Modal
        visible={showCreateDieModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseCreateDieModal}
      >
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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Ajouter une entrée</Text>

            {targetGroupForNewDie ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Action : {targetGroupForNewDie.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Faces du dé</Text>
              <TextInput
                value={newDieSides}
                onChangeText={onChangeNewDieSides}
                placeholder="6"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Quantité</Text>
              <TextInput
                value={newDieQty}
                onChangeText={onChangeNewDieQty}
                placeholder="1"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Modificateur</Text>
              <TextInput
                value={newDieModifier}
                onChangeText={onChangeNewDieModifier}
                placeholder="0"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Signe</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => onChangeNewDieSign("1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: newDieSign === "1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: newDieSign === "1" ? "700" : "400" }}>+</Text>
                </Pressable>

                <Pressable
                  onPress={() => onChangeNewDieSign("-1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newDieSign === "-1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: newDieSign === "-1" ? "700" : "400" }}>-</Text>
                </Pressable>
              </View>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle d’entrée</Text>

              <Pressable
                onPress={() => onChangeNewDieRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: newDieRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: newDieRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => onChangeNewDieRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newDieRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: newDieRuleId === rule.id ? "700" : "400" }}>
                    {rule.name}
                  </Text>
                </Pressable>
              ))}

              {legacyRules.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                  {legacyRules.map((rule) => (
                    <Pressable
                      key={rule.id}
                      onPress={() => onChangeNewDieRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: newDieRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: newDieRuleId === rule.id ? "700" : "400" }}>
                        {rule.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={onCloseCreateDieModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitCreateDie}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text style={{ fontWeight: "700" }}>Ajouter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!editingDie}
        transparent
        animationType="fade"
        onRequestClose={onCloseEditDieModal}
      >
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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Éditer l’entrée</Text>

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Faces du dé</Text>
              <TextInput
                value={editDieSides}
                onChangeText={onChangeEditDieSides}
                placeholder="6"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Quantité</Text>
              <TextInput
                value={editDieQty}
                onChangeText={onChangeEditDieQty}
                placeholder="1"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Modificateur</Text>
              <TextInput
                value={editDieModifier}
                onChangeText={onChangeEditDieModifier}
                placeholder="0"
                keyboardType="numeric"
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12 }}>Signe</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable
                  onPress={() => onChangeEditDieSign("1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginRight: 8,
                    opacity: editDieSign === "1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: editDieSign === "1" ? "700" : "400" }}>+</Text>
                </Pressable>

                <Pressable
                  onPress={() => onChangeEditDieSign("-1")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: editDieSign === "-1" ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontWeight: editDieSign === "-1" ? "700" : "400" }}>-</Text>
                </Pressable>
              </View>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle d’entrée</Text>

              <Pressable
                onPress={() => onChangeSelectedRuleId(null)}
                style={{
                  marginTop: 8,
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

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Pipelines</Text>
              {pipelineRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => onChangeSelectedRuleId(rule.id)}
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
                      onPress={() => onChangeSelectedRuleId(rule.id)}
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
                        type: {rule.kind}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={onCloseEditDieModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitEditDie}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}
              >
                <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}