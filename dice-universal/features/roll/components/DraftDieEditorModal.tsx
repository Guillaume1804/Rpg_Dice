// dice-universal/features/roll/components/DraftDieEditorModal.tsx

import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

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

function FieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontWeight: "800",
      }}
    >
      {children}
    </Text>
  );
}

function ModalInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "numeric",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "numeric" | "numbers-and-punctuation";
}) {
  const { theme } = useArcaneTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSubtle}
      keyboardType={keyboardType}
      style={{
        color: theme.colors.text,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 16,
      }}
    />
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
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
    </Pressable>
  );
}

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
            <Text style={styles.sectionTitle}>Configurer l’entrée</Text>

            {entryLabel ? (
              <Text style={styles.muted}>
                Entrée actuelle : {entryLabel}
              </Text>
            ) : (
              <Text style={styles.muted}>
                Ajuste le dé, son modificateur et sa règle.
              </Text>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 520 }}
            contentContainerStyle={{ gap: theme.spacing.md }}
            showsVerticalScrollIndicator
          >
            <View style={{ gap: theme.spacing.sm }}>
              <FieldLabel>Signe</FieldLabel>

              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <ChoiceButton
                  label="+"
                  selected={draftEditSign === "1"}
                  onPress={() => onChangeSign("1")}
                />

                <ChoiceButton
                  label="−"
                  selected={draftEditSign === "-1"}
                  onPress={() => onChangeSign("-1")}
                />
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <FieldLabel>Faces</FieldLabel>
              <ModalInput
                value={draftEditSides}
                onChangeText={onChangeSides}
                placeholder="Ex: 6"
              />
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <FieldLabel>Quantité</FieldLabel>
              <ModalInput
                value={draftEditQty}
                onChangeText={onChangeQty}
                placeholder="Ex: 3"
              />
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <FieldLabel>Modificateur</FieldLabel>
              <ModalInput
                value={draftEditModifier}
                onChangeText={onChangeModifier}
                placeholder="Ex: +2 ou -1"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Règle d’entrée
              </Text>

              <RuleOption
                label="Somme simple"
                description="Aucune règle spécifique sur cette entrée."
                selected={draftEditRuleId === null}
                onPress={() => onChangeRuleId(null)}
              />

              {modernRules.map((rule) => (
                <RuleOption
                  key={rule.id}
                  label={rule.name}
                  description={
                    rule.is_system === 1 ? "Règle système" : "Règle perso"
                  }
                  selected={draftEditRuleId === rule.id}
                  onPress={() => onChangeRuleId(rule.id)}
                />
              ))}

              {legacyRules.length > 0 ? (
                <View
                  style={{
                    gap: theme.spacing.sm,
                    marginTop: theme.spacing.sm,
                  }}
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
                      selected={draftEditRuleId === rule.id}
                      onPress={() => onChangeRuleId(rule.id)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
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
