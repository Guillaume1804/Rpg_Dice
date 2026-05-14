// dice-universal/features/tables/components/TableDieModals.tsx

import { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type {
  GroupDieRow,
  GroupRow,
} from "../../../data/repositories/groupsRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import { getCompatibleRulesForContext } from "../../rules/helpers/ruleCompatibility";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type Props = {
  showCreateDieModal: boolean;
  targetGroupForNewDie: GroupRow | null;
  newDieSides: string;
  newDieQty: string;
  newDieModifier: string;
  newDieSign: "1" | "-1";
  newDieRuleId: string | null;
  modernRules: RuleRow[];
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
        paddingVertical: 11,
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

function FieldLabel({ children }: { children: string }) {
  const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.text,
        fontWeight: "800",
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
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  const { theme } = useArcaneTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      selectionColor={theme.colors.accent}
      keyboardType={keyboardType}
      style={{
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
      }}
    />
  );
}

function SignPicker({
  value,
  onChange,
}: {
  value: "1" | "-1";
  onChange: (value: "1" | "-1") => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
      {[
        { value: "1" as const, label: "+" },
        { value: "-1" as const, label: "−" },
      ].map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              minWidth: 48,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: selected
                ? theme.colors.accent
                : theme.colors.border,
              borderRadius: theme.radius.pill,
              backgroundColor: selected
                ? theme.colors.accentSoft
                : theme.colors.surfaceAlt,
              opacity: pressed ? 0.84 : selected ? 1 : 0.72,
            })}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RuleOption({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.82,
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

      {detail ? (
        <Text
          style={{
            marginTop: 3,
            color: theme.colors.textMuted,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {detail}
        </Text>
      ) : null}
    </Pressable>
  );
}

function RulesPicker({
  selectedRuleId,
  modernRules,
  legacyRules,
  onSelectRuleId,
}: {
  selectedRuleId: string | null;
  modernRules: RuleRow[];
  legacyRules: RuleRow[];
  onSelectRuleId: (value: string | null) => void;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
          fontSize: 16,
        }}
      >
        Règle d’entrée
      </Text>

      <RuleOption
        label="Somme simple"
        detail="Aucune règle spéciale sur cette entrée."
        selected={selectedRuleId === null}
        onPress={() => onSelectRuleId(null)}
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
        Règles compatibles
      </Text>

      {modernRules.length === 0 && legacyRules.length === 0 ? (
        <View style={styles.cardSoft}>
          <Text style={styles.muted}>
            Aucune règle compatible avec ce type de dé.
          </Text>
        </View>
      ) : null}

      {modernRules.map((rule) => (
        <RuleOption
          key={rule.id}
          label={rule.name}
          detail={rule.is_system === 1 ? "Règle système" : "Règle perso"}
          selected={selectedRuleId === rule.id}
          onPress={() => onSelectRuleId(rule.id)}
        />
      ))}

      {legacyRules.length > 0 ? (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
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
              detail={`Ancienne règle · ${rule.kind}`}
              selected={selectedRuleId === rule.id}
              onPress={() => onSelectRuleId(rule.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DieModalShell({
  title,
  subtitle,
  actionName,
  sides,
  qty,
  modifier,
  sign,
  selectedRuleId,
  modernRules,
  legacyRules,
  onChangeSides,
  onChangeQty,
  onChangeModifier,
  onChangeSign,
  onChangeRuleId,
  onClose,
  onSubmit,
  submitLabel,
}: {
  title: string;
  subtitle: string;
  actionName?: string | null;
  sides: string;
  qty: string;
  modifier: string;
  sign: "1" | "-1";
  selectedRuleId: string | null;
  modernRules: RuleRow[];
  legacyRules: RuleRow[];
  onChangeSides: (value: string) => void;
  onChangeQty: (value: string) => void;
  onChangeModifier: (value: string) => void;
  onChangeSign: (value: "1" | "-1") => void;
  onChangeRuleId: (value: string | null) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.68)",
        justifyContent: "center",
        padding: theme.spacing.md,
      }}
    >
      <View
        style={{
          ...styles.card,
          maxHeight: "90%",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Entrée de dés
          </Text>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text style={styles.muted}>{subtitle}</Text>

          {actionName ? (
            <Text
              style={{
                color: theme.colors.accent,
                fontWeight: "800",
              }}
            >
              Action : {actionName}
            </Text>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <FieldLabel>Faces du dé</FieldLabel>
            <BoxInput
              value={sides}
              onChangeText={onChangeSides}
              placeholder="Ex: 6"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <FieldLabel>Quantité</FieldLabel>
            <BoxInput
              value={qty}
              onChangeText={onChangeQty}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <FieldLabel>Modificateur</FieldLabel>
            <BoxInput
              value={modifier}
              onChangeText={onChangeModifier}
              placeholder="Ex: 0"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <FieldLabel>Signe</FieldLabel>
            <SignPicker value={sign} onChange={onChangeSign} />
          </View>

          <RulesPicker
            selectedRuleId={selectedRuleId}
            modernRules={modernRules}
            legacyRules={legacyRules}
            onSelectRuleId={onChangeRuleId}
          />
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          <ModalButton label="Annuler" onPress={onClose} />

          <ModalButton
            label={submitLabel}
            onPress={onSubmit}
            variant="accent"
          />
        </View>
      </View>
    </View>
  );
}

export function TableDieModals({
  showCreateDieModal,
  targetGroupForNewDie,
  newDieSides,
  newDieQty,
  newDieModifier,
  newDieSign,
  newDieRuleId,
  modernRules,
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
  const createSides = Number(newDieSides);
  const editSides = Number(editDieSides);

  const compatibleModernRulesForCreate = useMemo(() => {
    if (!Number.isFinite(createSides) || createSides <= 0) {
      return modernRules;
    }

    return getCompatibleRulesForContext(modernRules, {
      scope: "entry",
      sides: [createSides],
    });
  }, [modernRules, createSides]);

  const compatibleLegacyRulesForCreate = useMemo(() => {
    if (!Number.isFinite(createSides) || createSides <= 0) {
      return legacyRules;
    }

    return getCompatibleRulesForContext(legacyRules, {
      scope: "entry",
      sides: [createSides],
    });
  }, [legacyRules, createSides]);

  const compatibleModernRulesForEdit = useMemo(() => {
    if (!Number.isFinite(editSides) || editSides <= 0) {
      return modernRules;
    }

    return getCompatibleRulesForContext(modernRules, {
      scope: "entry",
      sides: [editSides],
    });
  }, [modernRules, editSides]);

  const compatibleLegacyRulesForEdit = useMemo(() => {
    if (!Number.isFinite(editSides) || editSides <= 0) {
      return legacyRules;
    }

    return getCompatibleRulesForContext(legacyRules, {
      scope: "entry",
      sides: [editSides],
    });
  }, [legacyRules, editSides]);

  return (
    <>
      <Modal
        visible={showCreateDieModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseCreateDieModal}
      >
        <DieModalShell
          title="Ajouter une entrée"
          subtitle="Ajoute une ligne de dés à cette action sauvegardée."
          actionName={targetGroupForNewDie?.name ?? null}
          sides={newDieSides}
          qty={newDieQty}
          modifier={newDieModifier}
          sign={newDieSign}
          selectedRuleId={newDieRuleId}
          modernRules={compatibleModernRulesForCreate}
          legacyRules={compatibleLegacyRulesForCreate}
          onChangeSides={onChangeNewDieSides}
          onChangeQty={onChangeNewDieQty}
          onChangeModifier={onChangeNewDieModifier}
          onChangeSign={onChangeNewDieSign}
          onChangeRuleId={onChangeNewDieRuleId}
          onClose={onCloseCreateDieModal}
          onSubmit={onSubmitCreateDie}
          submitLabel="Ajouter"
        />
      </Modal>

      <Modal
        visible={!!editingDie}
        transparent
        animationType="fade"
        onRequestClose={onCloseEditDieModal}
      >
        <DieModalShell
          title="Éditer l’entrée"
          subtitle="Modifie les dés, le modificateur ou la règle appliquée à cette entrée."
          sides={editDieSides}
          qty={editDieQty}
          modifier={editDieModifier}
          sign={editDieSign}
          selectedRuleId={selectedRuleId}
          modernRules={compatibleModernRulesForEdit}
          legacyRules={compatibleLegacyRulesForEdit}
          onChangeSides={onChangeEditDieSides}
          onChangeQty={onChangeEditDieQty}
          onChangeModifier={onChangeEditDieModifier}
          onChangeSign={onChangeEditDieSign}
          onChangeRuleId={onChangeSelectedRuleId}
          onClose={onCloseEditDieModal}
          onSubmit={onSubmitEditDie}
          submitLabel="Sauvegarder"
        />
      </Modal>
    </>
  );
}
