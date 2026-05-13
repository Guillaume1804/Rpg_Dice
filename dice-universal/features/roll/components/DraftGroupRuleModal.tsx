// dice-universal/features/roll/components/DraftGroupRuleModal.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  visible: boolean;
  selectedRuleId: string | null;
  modernRules: RuleRow[];
  legacyRules: RuleRow[];
  onSelectRule: (ruleId: string | null) => void;
  onCancel: () => void;
  onSave: () => void;
};

function RuleOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      {description ? (
        <Text
          style={{
            color: arcane.colors.textMuted,
            fontSize: 12,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

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
        paddingVertical: 10,
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

export function DraftGroupRuleModal({
  visible,
  selectedRuleId,
  modernRules,
  legacyRules,
  onSelectRule,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.64)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            ...arcaneStyles.card,
            gap: arcane.spacing.md,
            borderColor: arcane.colors.accent,
            maxHeight: "90%",
          }}
        >
          <View style={{ gap: arcane.spacing.xs }}>
            <Text style={arcaneStyles.sectionTitle}>
              Règle du groupe temporaire
            </Text>

            <Text style={arcaneStyles.muted}>
              Choisis une règle appliquée à l’ensemble du groupe de dés.
            </Text>
          </View>

          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ gap: arcane.spacing.sm }}
            showsVerticalScrollIndicator
          >
            <RuleOption
              label="Somme simple"
              description="Aucune règle de groupe spécifique."
              selected={selectedRuleId === null}
              onPress={() => onSelectRule(null)}
            />

            <Text
              style={{
                color: arcane.colors.textSubtle,
                fontSize: arcane.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: arcane.spacing.xs,
              }}
            >
              Règles disponibles
            </Text>

            {modernRules.length === 0 && legacyRules.length === 0 ? (
              <View style={arcaneStyles.cardSoft}>
                <Text style={arcaneStyles.muted}>
                  Aucune règle disponible pour ce contexte.
                </Text>
              </View>
            ) : null}

            {modernRules.map((rule) => (
              <RuleOption
                key={rule.id}
                label={rule.name}
                description={
                  rule.is_system === 1 ? "Règle système" : "Règle perso"
                }
                selected={selectedRuleId === rule.id}
                onPress={() => onSelectRule(rule.id)}
              />
            ))}

            {legacyRules.length > 0 ? (
              <View
                style={{ gap: arcane.spacing.sm, marginTop: arcane.spacing.sm }}
              >
                <Text
                  style={{
                    color: arcane.colors.textSubtle,
                    fontSize: arcane.typography.tiny,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Compatibilité
                </Text>

                {legacyRules.map((rule) => (
                  <RuleOption
                    key={rule.id}
                    label={rule.name}
                    description={`Ancienne famille : ${rule.kind}`}
                    selected={selectedRuleId === rule.id}
                    onPress={() => onSelectRule(rule.id)}
                  />
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: arcane.spacing.sm,
            }}
          >
            <ModalButton label="Annuler" onPress={onCancel} />
            <ModalButton
              label="Sauvegarder"
              onPress={onSave}
              variant="accent"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
