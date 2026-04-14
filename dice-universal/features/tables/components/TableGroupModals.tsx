import { useMemo } from "react";
import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getRulesForScope } from "../../rules/helpers/ruleCompatibility";

type Props = {
  showRenameGroupModal: boolean;
  renameGroupValue: string;
  onChangeRenameGroupValue: (value: string) => void;
  onCloseRenameGroupModal: () => void;
  onSubmitRenameGroup: () => void | Promise<void>;

  showEditGroupRuleModal: boolean;
  editingGroupForRule: GroupRow | null;
  selectedGroupRuleId: string | null;
  onSelectGroupRuleId: (value: string | null) => void;
  onCloseEditGroupRuleModal: () => void;
  onSubmitEditGroupRule: () => void | Promise<void>;
};

export function TableGroupModals({
  showRenameGroupModal,
  renameGroupValue,
  onChangeRenameGroupValue,
  onCloseRenameGroupModal,
  onSubmitRenameGroup,
  showEditGroupRuleModal,
  editingGroupForRule,
  selectedGroupRuleId,
  onSelectGroupRuleId,
  onCloseEditGroupRuleModal,
  onSubmitEditGroupRule,
}: Props) {
  const compatibleModernRules = useMemo(
    () => getRulesForScope(modernRules, "group"),
    [modernRules],
  );

  const compatibleLegacyRules = useMemo(
    () => getRulesForScope(legacyRules, "group"),
    [legacyRules],
  );

  return (
    <>
      <Modal
        visible={showRenameGroupModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseRenameGroupModal}
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
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Renommer l’action
            </Text>

            <TextInput
              value={renameGroupValue}
              onChangeText={onChangeRenameGroupValue}
              placeholder="Nouveau nom de l’action..."
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Pressable
                onPress={onCloseRenameGroupModal}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  marginRight: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitRenameGroup}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Renommer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditGroupRuleModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseEditGroupRuleModal}
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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Modifier la règle de l’action
            </Text>

            {editingGroupForRule ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Action : {editingGroupForRule.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Pressable
                onPress={() => onSelectGroupRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: selectedGroupRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: selectedGroupRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>
                Règles disponibles
              </Text>

              {compatibleModernRules.length === 0 &&
                compatibleLegacyRules.length === 0 ? (
                <Text style={{ marginTop: 8, opacity: 0.7 }}>
                  Aucune règle de groupe disponible.
                </Text>
              ) : null}

              {compatibleModernRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => onSelectGroupRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: selectedGroupRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: selectedGroupRuleId === rule.id ? "700" : "400" }}>
                    {rule.name}
                  </Text>
                </Pressable>
              ))}

              {compatibleLegacyRules.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                  {compatibleLegacyRules.map((rule) => (
                    <Pressable
                      key={rule.id}
                      onPress={() => onSelectGroupRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: selectedGroupRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: selectedGroupRuleId === rule.id ? "700" : "400" }}>
                        {rule.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <Pressable
                onPress={onCloseEditGroupRuleModal}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginRight: 10,
                }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitEditGroupRule}
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