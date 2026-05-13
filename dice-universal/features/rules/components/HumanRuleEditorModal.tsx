// dice-universal/features/rules/components/HumanRuleEditorModal.tsx

import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import { RULE_FAMILIES } from "../config/ruleFamilies";
import type { RuleFormState } from "../helpers/ruleForm";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  visible: boolean;
  editingRule: RuleRow | null;
  form: RuleFormState;
  formError: string | null;
  previewValues: string;
  previewSides: string;
  previewModifier: string;
  previewSign: "1" | "-1";
  previewResult: string;
  onChangePreviewValues: (value: string) => void;
  onChangePreviewSides: (value: string) => void;
  onChangePreviewModifier: (value: string) => void;
  onChangePreviewSign: (value: "1" | "-1") => void;
  onUpdateForm: <K extends keyof RuleFormState>(
    key: K,
    value: RuleFormState[K],
  ) => void;
  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;
  onComputePreview: () => void;
  onClose: () => void;
  onSave: () => void;
  onSetScope: (scope: "entry" | "group" | "both") => void;
  onSetSupportedSidesText: (value: string) => void;
};

function isScopeLocked(family: RuleFormState["family"]) {
  return family === "success_pool";
}

function getForcedScopeForFamily(
  family: RuleFormState["family"],
): RuleScope | null {
  if (family === "success_pool") return "group";
  return null;
}

function getScopeLabel(scope: RuleScope) {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Les deux";
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.textMuted,
        fontWeight: "800",
      }}
    >
      {children}
    </Text>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.textSubtle,
        fontSize: arcane.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function BoxInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "numbers-and-punctuation";
  editable?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={arcane.colors.textSubtle}
      selectionColor={arcane.colors.accent}
      keyboardType={keyboardType}
      editable={editable}
      style={{
        minHeight: 48,
        borderWidth: 1,
        borderColor: arcane.colors.border,
        borderRadius: arcane.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: arcane.colors.surfaceAlt,
        color: arcane.colors.text,
        fontSize: 16,
        fontWeight: "700",
        opacity: editable ? 1 : 0.62,
      }}
    />
  );
}
function ChoiceCard({
  title,
  description,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: disabled ? 0.62 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 15,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: arcane.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function PillButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
  disabled?: boolean;
}) {
  const borderColor =
    variant === "accent"
      ? arcane.colors.accent
      : variant === "danger"
        ? arcane.colors.failure
        : arcane.colors.border;

  const backgroundColor =
    variant === "accent"
      ? arcane.colors.accentSoft
      : variant === "danger"
        ? arcane.colors.failureSoft
        : arcane.colors.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor,
        borderRadius: arcane.radius.pill,
        backgroundColor,
        opacity: disabled ? 0.48 : pressed ? 0.84 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.sm,
      }}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: arcane.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

export function HumanRuleEditorModal({
  visible,
  editingRule,
  form,
  formError,
  previewValues,
  previewSides,
  previewModifier,
  previewSign,
  previewResult,
  onChangePreviewValues,
  onChangePreviewSides,
  onChangePreviewModifier,
  onChangePreviewSign,
  onUpdateForm,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,
  onComputePreview,
  onClose,
  onSave,
}: Props) {
  const lockedScope = getForcedScopeForFamily(form.family);
  const displayedScope = lockedScope ?? form.scope;

  const isReadOnlySystemRule =
    editingRule?.usage_kind === "system_template" ||
    editingRule?.is_system === 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            maxHeight: "92%",
            gap: arcane.spacing.md,
            borderColor: arcane.colors.accent,
          }}
        >
          <View style={{ gap: arcane.spacing.xs }}>
            <SectionLabel>Éditeur avancé</SectionLabel>

            <Text style={arcaneStyles.sectionTitle}>
              {isReadOnlySystemRule
                ? "Consulter une règle système"
                : editingRule
                  ? "Modifier une règle"
                  : "Créer une règle"}
            </Text>

            <Text style={arcaneStyles.muted}>
              {isReadOnlySystemRule
                ? "Cette règle système est protégée. Tu peux la consulter et la tester, mais pas la modifier."
                : "Configure précisément une règle de lancer, ses dés compatibles, sa portée et sa prévisualisation."}
            </Text>
          </View>

          {isReadOnlySystemRule ? (
            <View
              style={{
                ...arcaneStyles.cardSoft,
                borderColor: arcane.colors.warning,
                backgroundColor: arcane.colors.warningSoft,
              }}
            >
              <Text
                style={{
                  color: arcane.colors.text,
                  fontWeight: "900",
                }}
              >
                Règle protégée
              </Text>

              <Text style={arcaneStyles.muted}>
                Les règles système servent de modèles de base. Pour créer ta
                propre variante, utilise la création guidée ou l’éditeur avancé.
              </Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={{
              gap: arcane.spacing.md,
              paddingBottom: arcane.spacing.sm,
            }}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            <SectionCard title="Identité">
              <FieldLabel>Nom</FieldLabel>
              <BoxInput
                value={form.name}
                onChangeText={(value) => onUpdateForm("name", value)}
                placeholder="Ex: Test d’attaque D20"
                editable={!isReadOnlySystemRule}
              />
            </SectionCard>

            <SectionCard
              title="Famille de règle"
              description="Choisis le type de comportement principal que cette règle doit avoir."
            >
              {RULE_FAMILIES.map((family) => (
                <ChoiceCard
                  key={family.key}
                  title={family.label}
                  description={family.description}
                  selected={form.family === family.key}
                  disabled={isReadOnlySystemRule}
                  onPress={() => onUpdateForm("family", family.key)}
                />
              ))}
            </SectionCard>

            <SectionCard
              title="Dés compatibles"
              description="Indique les types de dés utilisables avec cette règle, séparés par des virgules."
            >
              <BoxInput
                value={form.supportedSidesText}
                onChangeText={(value) =>
                  onUpdateForm("supportedSidesText", value)
                }
                placeholder="Ex: 6 ou 20, 100"
                editable={!isReadOnlySystemRule}
              />
            </SectionCard>

            <SectionCard
              title="Portée"
              description="Détermine si la règle s’applique à une entrée de dés, à un groupe complet, ou aux deux."
            >
              {isScopeLocked(form.family) ? (
                <ChoiceCard
                  title={getScopeLabel(displayedScope)}
                  description="Cette famille impose automatiquement une portée de groupe."
                  selected
                  disabled
                />
              ) : (
                <View style={{ gap: arcane.spacing.sm }}>
                  {(["entry", "group", "both"] as RuleScope[]).map((scope) => (
                    <ChoiceCard
                      key={scope}
                      title={getScopeLabel(scope)}
                      selected={form.scope === scope}
                      disabled={isReadOnlySystemRule}
                      onPress={() => onUpdateForm("scope", scope)}
                    />
                  ))}
                </View>
              )}
            </SectionCard>

            {(form.family === "single_check" ||
              form.family === "highest_of_pool") && (
              <SectionCard title="Test contre un seuil">
                <FieldLabel>Comparaison</FieldLabel>

                <View
                  style={{
                    flexDirection: "row",
                    gap: arcane.spacing.sm,
                    flexWrap: "wrap",
                  }}
                >
                  <PillButton
                    label="Seuil haut (≥)"
                    onPress={() => onUpdateForm("compare", "gte")}
                    variant={form.compare === "gte" ? "accent" : "default"}
                    disabled={isReadOnlySystemRule}
                  />

                  <PillButton
                    label="Seuil bas (≤)"
                    onPress={() => onUpdateForm("compare", "lte")}
                    variant={form.compare === "lte" ? "accent" : "default"}
                    disabled={isReadOnlySystemRule}
                  />
                </View>

                <FieldLabel>Seuil de réussite</FieldLabel>
                <BoxInput
                  value={form.successThreshold}
                  onChangeText={(value) =>
                    onUpdateForm("successThreshold", value)
                  }
                  placeholder="10"
                  keyboardType="numeric"
                  editable={!isReadOnlySystemRule}
                />

                <FieldLabel>Faces de réussite critique</FieldLabel>
                <BoxInput
                  value={form.critSuccessFaces}
                  onChangeText={(value) =>
                    onUpdateForm("critSuccessFaces", value)
                  }
                  placeholder="20"
                  editable={!isReadOnlySystemRule}
                />

                <FieldLabel>Faces d’échec critique</FieldLabel>
                <BoxInput
                  value={form.critFailureFaces}
                  onChangeText={(value) =>
                    onUpdateForm("critFailureFaces", value)
                  }
                  placeholder="1"
                  editable={!isReadOnlySystemRule}
                />
              </SectionCard>
            )}

            {form.family === "success_pool" && (
              <SectionCard title="Pool de succès">
                <FieldLabel>Réussite à partir de</FieldLabel>
                <BoxInput
                  value={form.successAtOrAbove}
                  onChangeText={(value) =>
                    onUpdateForm("successAtOrAbove", value)
                  }
                  placeholder="5"
                  keyboardType="numeric"
                  editable={!isReadOnlySystemRule}
                />

                <FieldLabel>Faces d’échec spécial</FieldLabel>
                <BoxInput
                  value={form.failFaces}
                  onChangeText={(value) => onUpdateForm("failFaces", value)}
                  placeholder="1"
                  editable={!isReadOnlySystemRule}
                />

                <FieldLabel>Règle de complication</FieldLabel>

                {[
                  {
                    key: "ones_gt_successes",
                    label: "Si échecs spéciaux > réussites",
                  },
                  {
                    key: "ones_gte_successes",
                    label: "Si échecs spéciaux ≥ réussites",
                  },
                  {
                    key: "none",
                    label: "Aucune complication",
                  },
                ].map((option) => (
                  <ChoiceCard
                    key={option.key}
                    title={option.label}
                    selected={form.glitchRule === option.key}
                    disabled={isReadOnlySystemRule}
                    onPress={() =>
                      onUpdateForm(
                        "glitchRule",
                        option.key as RuleFormState["glitchRule"],
                      )
                    }
                  />
                ))}
              </SectionCard>
            )}

            {(form.family === "banded_sum" ||
              form.family === "table_lookup") && (
              <SectionCard
                title={form.family === "banded_sum" ? "Paliers" : "Intervalles"}
                description="Définis les plages numériques et le résultat associé."
              >
                {form.ranges.map((row, index) => (
                  <View
                    key={index}
                    style={{
                      ...arcaneStyles.cardSoft,
                      gap: arcane.spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: arcane.colors.text,
                        fontWeight: "900",
                      }}
                    >
                      Ligne {index + 1}
                    </Text>

                    <BoxInput
                      value={row.min}
                      onChangeText={(value) =>
                        onUpdateRangeRow(index, "min", value)
                      }
                      placeholder="Min"
                      keyboardType="numeric"
                      editable={!isReadOnlySystemRule}
                    />

                    <BoxInput
                      value={row.max}
                      onChangeText={(value) =>
                        onUpdateRangeRow(index, "max", value)
                      }
                      placeholder="Max"
                      keyboardType="numeric"
                      editable={!isReadOnlySystemRule}
                    />

                    <BoxInput
                      value={row.label}
                      onChangeText={(value) =>
                        onUpdateRangeRow(index, "label", value)
                      }
                      placeholder="Label"
                      editable={!isReadOnlySystemRule}
                    />

                    {!isReadOnlySystemRule ? (
                      <PillButton
                        label="Supprimer cette ligne"
                        onPress={() => onRemoveRangeRow(index)}
                        variant="danger"
                      />
                    ) : null}
                  </View>
                ))}

                {!isReadOnlySystemRule ? (
                  <PillButton
                    label="Ajouter une ligne"
                    onPress={onAddRangeRow}
                    variant="accent"
                  />
                ) : null}
              </SectionCard>
            )}

            <SectionCard
              title="Prévisualisation"
              description="Simule un résultat pour vérifier que la règle se comporte comme prévu."
            >
              <FieldLabel>Valeurs test</FieldLabel>
              <BoxInput
                value={previewValues}
                onChangeText={onChangePreviewValues}
                placeholder="1, 4, 6"
              />

              <FieldLabel>Faces</FieldLabel>
              <BoxInput
                value={previewSides}
                onChangeText={onChangePreviewSides}
                placeholder="6"
                keyboardType="numeric"
              />

              <FieldLabel>Modificateur</FieldLabel>
              <BoxInput
                value={previewModifier}
                onChangeText={onChangePreviewModifier}
                placeholder="0"
                keyboardType="numbers-and-punctuation"
              />

              <FieldLabel>Signe</FieldLabel>
              <View
                style={{
                  flexDirection: "row",
                  gap: arcane.spacing.sm,
                  flexWrap: "wrap",
                }}
              >
                <PillButton
                  label="+"
                  onPress={() => onChangePreviewSign("1")}
                  variant={previewSign === "1" ? "accent" : "default"}
                />

                <PillButton
                  label="−"
                  onPress={() => onChangePreviewSign("-1")}
                  variant={previewSign === "-1" ? "accent" : "default"}
                />
              </View>

              <PillButton
                label="Calculer un aperçu"
                onPress={onComputePreview}
                variant="accent"
              />

              {formError ? (
                <View
                  style={{
                    ...arcaneStyles.cardSoft,
                    borderColor: arcane.colors.failure,
                    backgroundColor: arcane.colors.failureSoft,
                  }}
                >
                  <Text
                    style={{
                      color: arcane.colors.text,
                      fontWeight: "800",
                    }}
                  >
                    {formError}
                  </Text>
                </View>
              ) : null}

              {previewResult ? (
                <View
                  style={{
                    ...arcaneStyles.cardSoft,
                    backgroundColor: arcane.colors.surfaceAlt,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      color: arcane.colors.text,
                      fontFamily: "monospace",
                      lineHeight: 20,
                    }}
                  >
                    {previewResult}
                  </Text>
                </View>
              ) : null}
            </SectionCard>
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: arcane.spacing.sm,
            }}
          >
            <PillButton
              label={isReadOnlySystemRule ? "Fermer" : "Annuler"}
              onPress={onClose}
            />

            {!isReadOnlySystemRule ? (
              <PillButton
                label="Sauvegarder"
                onPress={onSave}
                variant="accent"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
