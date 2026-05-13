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

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.text,
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
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={arcane.colors.textMuted}
      selectionColor={arcane.colors.accent}
      keyboardType={keyboardType}
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
  );
}

function SignPicker({
  value,
  onChange,
}: {
  value: "1" | "-1";
  onChange: (value: "1" | "-1") => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: arcane.spacing.sm }}>
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
                ? arcane.colors.accent
                : arcane.colors.border,
              borderRadius: arcane.radius.pill,
              backgroundColor: selected
                ? arcane.colors.accentSoft
                : arcane.colors.surfaceAlt,
              opacity: pressed ? 0.84 : selected ? 1 : 0.72,
            })}
          >
            <Text
              style={{
                color: arcane.colors.text,
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: arcane.spacing.sm,
        borderWidth: 1,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.md,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.82,
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

      {detail ? (
        <Text
          style={{
            marginTop: 3,
            color: arcane.colors.textMuted,
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
  return (
    <View style={{ gap: arcane.spacing.sm }}>
      <Text
        style={{
          color: arcane.colors.text,
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
          color: arcane.colors.textSubtle,
          fontSize: arcane.typography.tiny,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginTop: arcane.spacing.xs,
        }}
      >
        Règles compatibles
      </Text>

      {modernRules.length === 0 && legacyRules.length === 0 ? (
        <View style={arcaneStyles.cardSoft}>
          <Text style={arcaneStyles.muted}>
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
        <View style={{ gap: arcane.spacing.sm, marginTop: arcane.spacing.xs }}>
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
  return (
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
            Entrée de dés
          </Text>

          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text style={arcaneStyles.muted}>{subtitle}</Text>

          {actionName ? (
            <Text
              style={{
                color: arcane.colors.accent,
                fontWeight: "800",
              }}
            >
              Action : {actionName}
            </Text>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: arcane.spacing.md,
            paddingBottom: arcane.spacing.sm,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: arcane.spacing.xs }}>
            <FieldLabel>Faces du dé</FieldLabel>
            <BoxInput
              value={sides}
              onChangeText={onChangeSides}
              placeholder="Ex: 6"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: arcane.spacing.xs }}>
            <FieldLabel>Quantité</FieldLabel>
            <BoxInput
              value={qty}
              onChangeText={onChangeQty}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: arcane.spacing.xs }}>
            <FieldLabel>Modificateur</FieldLabel>
            <BoxInput
              value={modifier}
              onChangeText={onChangeModifier}
              placeholder="Ex: 0"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: arcane.spacing.xs }}>
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
            gap: arcane.spacing.sm,
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
