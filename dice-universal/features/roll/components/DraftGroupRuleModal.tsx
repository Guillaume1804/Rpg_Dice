// dice-universal/features/roll/components/DraftGroupRuleModal.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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
  const { theme, styles } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
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
  const { theme } = useArcaneTheme();
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: isAccent
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
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
  const { theme, styles } = useArcaneTheme();
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
            ...styles.card,
            gap: theme.spacing.md,
            borderColor: theme.colors.accent,
            maxHeight: "90%",
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text style={styles.sectionTitle}>
              Règle du groupe temporaire
            </Text>

            <Text style={styles.muted}>
              Choisis une règle appliquée à l’ensemble du groupe de dés.
            </Text>
          </View>

          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ gap: theme.spacing.sm }}
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
                color: theme.colors.textSubtle,
                fontSize: theme.typography.tiny,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: theme.spacing.xs,
              }}
            >
              Règles disponibles
            </Text>

            {modernRules.length === 0 && legacyRules.length === 0 ? (
              <View style={styles.cardSoft}>
                <Text style={styles.muted}>
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
                style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}
              >
                <Text
                  style={{
                    color: theme.colors.textSubtle,
                    fontSize: theme.typography.tiny,
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
              gap: theme.spacing.sm,
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
