// dice-universal/features/tables/components/TableGroupModals.tsx

import { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type { GroupRow } from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getRulesForScope } from "../../rules/helpers/ruleCompatibility";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  modernRules: RuleRow[];
  legacyRules: RuleRow[];

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

function ModalButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: isAccent
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RuleChoice({
  label,
  subtitle,
  selected,
  onPress,
}: {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: arcane.spacing.md,
        borderWidth: 1,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.lg,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        gap: 4,
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 15,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      {subtitle ? (
        <Text
          style={{
            color: arcane.colors.textMuted,
            fontSize: 12,
            lineHeight: 17,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function TableGroupModals({
  modernRules,
  legacyRules,
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
            backgroundColor: "rgba(0,0,0,0.68)",
            justifyContent: "center",
            padding: arcane.spacing.md,
          }}
        >
          <View
            style={{
              ...arcaneStyles.card,
              gap: arcane.spacing.md,
            }}
          >
            <View style={{ gap: arcane.spacing.xs }}>
              <Text
                style={{
                  color: arcane.colors.textSubtle,
                  fontSize: arcane.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Action
              </Text>

              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                Renommer l’action
              </Text>

              <Text style={arcaneStyles.muted}>
                Donne un nom clair à cette action pour la retrouver rapidement
                dans le profil et sur l’écran Jet.
              </Text>
            </View>

            <View style={{ gap: arcane.spacing.xs }}>
              <Text
                style={{
                  color: arcane.colors.text,
                  fontWeight: "800",
                }}
              >
                Nouveau nom
              </Text>

              <TextInput
                value={renameGroupValue}
                onChangeText={onChangeRenameGroupValue}
                placeholder="Ex: Attaque, Perception, Persuasion..."
                placeholderTextColor={arcane.colors.textMuted}
                selectionColor={arcane.colors.accent}
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: arcane.colors.border,
                  borderRadius: arcane.radius.md,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: arcane.colors.surfaceAlt,
                  color: arcane.colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: arcane.spacing.sm,
              }}
            >
              <ModalButton label="Annuler" onPress={onCloseRenameGroupModal} />
              <ModalButton
                label="Renommer"
                onPress={onSubmitRenameGroup}
                variant="accent"
              />
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
            backgroundColor: "rgba(0,0,0,0.68)",
            justifyContent: "center",
            padding: arcane.spacing.md,
          }}
        >
          <View
            style={{
              ...arcaneStyles.card,
              maxHeight: "90%",
              gap: arcane.spacing.md,
            }}
          >
            <View style={{ gap: arcane.spacing.xs }}>
              <Text
                style={{
                  color: arcane.colors.textSubtle,
                  fontSize: arcane.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Règle d’action
              </Text>

              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                Modifier la règle de l’action
              </Text>

              {editingGroupForRule ? (
                <Text style={arcaneStyles.muted}>
                  Action : {editingGroupForRule.name}
                </Text>
              ) : (
                <Text style={arcaneStyles.muted}>
                  Choisis le comportement appliqué à l’ensemble de l’action.
                </Text>
              )}
            </View>

            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ gap: arcane.spacing.sm }}
              showsVerticalScrollIndicator={false}
            >
              <RuleChoice
                label="Somme simple"
                subtitle="Aucune règle de groupe : les entrées sont additionnées normalement."
                selected={selectedGroupRuleId === null}
                onPress={() => onSelectGroupRuleId(null)}
              />

              <Text
                style={{
                  color: arcane.colors.textSubtle,
                  fontSize: arcane.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginTop: arcane.spacing.sm,
                }}
              >
                Règles disponibles
              </Text>

              {compatibleModernRules.length === 0 &&
              compatibleLegacyRules.length === 0 ? (
                <View style={arcaneStyles.cardSoft}>
                  <Text
                    style={{
                      color: arcane.colors.text,
                      fontWeight: "800",
                    }}
                  >
                    Aucune règle de groupe disponible
                  </Text>

                  <Text
                    style={[
                      arcaneStyles.muted,
                      { marginTop: arcane.spacing.xs },
                    ]}
                  >
                    Crée une règle compatible ou utilise la somme simple.
                  </Text>
                </View>
              ) : null}

              {compatibleModernRules.map((rule) => (
                <RuleChoice
                  key={rule.id}
                  label={rule.name}
                  subtitle={
                    rule.is_system === 1 ? "Règle système" : "Règle perso"
                  }
                  selected={selectedGroupRuleId === rule.id}
                  onPress={() => onSelectGroupRuleId(rule.id)}
                />
              ))}

              {compatibleLegacyRules.length > 0 ? (
                <>
                  <Text
                    style={{
                      color: arcane.colors.textSubtle,
                      fontSize: arcane.typography.tiny,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      marginTop: arcane.spacing.sm,
                    }}
                  >
                    Compatibilité
                  </Text>

                  {compatibleLegacyRules.map((rule) => (
                    <RuleChoice
                      key={rule.id}
                      label={rule.name}
                      subtitle={`Ancienne règle · type : ${rule.kind}`}
                      selected={selectedGroupRuleId === rule.id}
                      onPress={() => onSelectGroupRuleId(rule.id)}
                    />
                  ))}
                </>
              ) : null}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: arcane.spacing.sm,
              }}
            >
              <ModalButton
                label="Annuler"
                onPress={onCloseEditGroupRuleModal}
              />
              <ModalButton
                label="Sauvegarder"
                onPress={onSubmitEditGroupRule}
                variant="accent"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
