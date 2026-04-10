import { View, Text, Pressable, TextInput, Modal, ScrollView } from "react-native";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type Props = {
  showCreateGroupModal: boolean;
  targetProfileForNewGroup: ProfileRow | null;
  newGroupName: string;
  newGroupRuleId: string | null;
  modernRules: RuleRow[];
  legacyRules: RuleRow[];
  onChangeNewGroupName: (value: string) => void;
  onSelectNewGroupRuleId: (value: string | null) => void;
  onCloseCreateGroupModal: () => void;
  onSubmitCreateGroup: () => void | Promise<void>;

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
  showCreateGroupModal,
  targetProfileForNewGroup,
  newGroupName,
  newGroupRuleId,
  modernRules,
  legacyRules,
  onChangeNewGroupName,
  onSelectNewGroupRuleId,
  onCloseCreateGroupModal,
  onSubmitCreateGroup,
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
  return (
    <>
      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseCreateGroupModal}
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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Créer une action</Text>

            {targetProfileForNewGroup ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Profil : {targetProfileForNewGroup.name}
              </Text>
            ) : null}

            <ScrollView style={{ marginTop: 12 }}>
              <Text>Nom de l’action</Text>
              <TextInput
                value={newGroupName}
                onChangeText={onChangeNewGroupName}
                placeholder="Ex: Attaque, Esquive, Dégâts..."
                style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règle de groupe</Text>

              <Pressable
                onPress={() => onSelectNewGroupRuleId(null)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  opacity: newGroupRuleId === null ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: newGroupRuleId === null ? "700" : "400" }}>
                  Somme (par défaut)
                </Text>
              </Pressable>

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règles disponibles</Text>
              {modernRules.map((rule) => (
                <Pressable
                  key={rule.id}
                  onPress={() => onSelectNewGroupRuleId(rule.id)}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    opacity: newGroupRuleId === rule.id ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: newGroupRuleId === rule.id ? "700" : "400" }}>
                    {rule.name}
                  </Text>
                </Pressable>
              ))}

              {legacyRules.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Anciennes règles</Text>
                  {legacyRules.map((rule) => (
                    <Pressable
                      key={rule.id}
                      onPress={() => onSelectNewGroupRuleId(rule.id)}
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 8,
                        opacity: newGroupRuleId === rule.id ? 1 : 0.7,
                      }}
                    >
                      <Text style={{ fontWeight: newGroupRuleId === rule.id ? "700" : "400" }}>
                        {rule.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={onCloseCreateGroupModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
              >
                <Text>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={onSubmitCreateGroup}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: "700" }}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={{ fontSize: 16, fontWeight: "700" }}>Renommer l’action</Text>

            <TextInput
              value={renameGroupValue}
              onChangeText={onChangeRenameGroupValue}
              placeholder="Nouveau nom de l’action..."
              style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <Pressable
                onPress={onCloseRenameGroupModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 10, marginRight: 10 }}
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

              <Text style={{ marginTop: 12, fontWeight: "700" }}>Règles Disponibles</Text>
              {modernRules.map((rule) => (
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

              {legacyRules.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Compatibilité</Text>
                  {legacyRules.map((rule) => (
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

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
              <Pressable
                onPress={onCloseEditGroupRuleModal}
                style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginRight: 10 }}
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