// dice-universal/features/roll/components/QuickDieBehaviorPickerModal.tsx

import { View, Text, Pressable } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

import { BehaviorPickerOptionCard } from "./BehaviorPickerOptionCard";

import { PremiumBottomSheet } from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type BehaviorDefinition = {
  key: RuleBehaviorKey;
  label: string;
  description?: string;
  defaultScope?: "entry" | "group" | "both";
};

type Props = {
  visible: boolean;
  editingDieSides: number | null;
  behaviors: QuickBehaviorPickerOption[];
  getDefinition: (behaviorKey: RuleBehaviorKey) => BehaviorDefinition | null;
  onSelectBehavior: (option: QuickBehaviorPickerOption) => void;
  onClose: () => void;
};

export function QuickDieBehaviorPickerModal({
  visible,
  editingDieSides,
  behaviors,
  getDefinition,
  onSelectBehavior,
  onClose,
}: Props) {
  const premium = usePremiumTheme();

  const isVisible = visible && editingDieSides !== null;

  return (
    <PremiumBottomSheet
      visible={isVisible}
      title={
        editingDieSides !== null
          ? `Configurer d${editingDieSides}`
          : "Configurer un dé"
      }
      subtitle="Choisis comment ce dé doit être interprété au moment du lancer."
      onClose={onClose}
      maxHeight="88%"
      footer={
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            minHeight: 48,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: pressed
              ? premium.colors.surface.pressed
              : premium.colors.surface.subtle,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.86 : 1,
            transform: [
              {
                scale: pressed ? premium.animation.pressScale : 1,
              },
            ],
          })}
        >
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            Annuler
          </Text>
        </Pressable>
      }
    >
      <View style={{ gap: premium.spacing.md }}>
        <View
          style={{
            borderRadius: premium.radius.xl,
            borderWidth: 1,
            borderColor: premium.colors.border.accent,
            backgroundColor: premium.colors.accent.soft,
            padding: premium.spacing.md,
            gap: premium.spacing.xs,
          }}
        >
          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: premium.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Comportement rapide
          </Text>

          <Text
            style={{
              color: premium.colors.text.primary,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            d{editingDieSides ?? "?"}
          </Text>

          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 12,
              lineHeight: 17,
              fontWeight: "700",
            }}
          >
            Cette sélection crée un dé déjà configuré dans le jet préparé.
          </Text>
        </View>

        {behaviors.length === 0 ? (
          <View
            style={{
              borderRadius: premium.radius.lg,
              borderWidth: 1,
              borderColor: premium.colors.border.subtle,
              backgroundColor: premium.colors.surface.subtle,
              padding: premium.spacing.md,
            }}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 13,
                lineHeight: 18,
                fontWeight: "700",
              }}
            >
              Aucun comportement compatible avec ce dé.
            </Text>
          </View>
        ) : null}

        {behaviors.map((behavior) => {
          const def = getDefinition(behavior.behaviorKey);
          if (!def) return null;

          const label = behavior.label ?? def.label;
          const description = behavior.description ?? def.description;

          return (
            <BehaviorPickerOptionCard
              key={behavior.optionId}
              behaviorKey={behavior.behaviorKey}
              label={label}
              description={description}
              scope={def.defaultScope}
              disabled={!behavior.enabled}
              onPress={() => onSelectBehavior(behavior)}
            />
          );
        })}
      </View>
    </PremiumBottomSheet>
  );
}
