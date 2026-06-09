import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryAdjustment } from "../types";

type Roll3DActionEntryAdjustmentCardProps = {
  adjustment: Roll3DActionEntryAdjustment;
  compact?: boolean;
  onChangeQty: (delta: number) => void;
  onChangeModifier: (delta: number) => void;
  onToggleSign: () => void;
  onClose: () => void;
};

function SmallButton({
  label,
  disabled,
  variant = "default",
  onPress,
}: {
  label: string;
  disabled?: boolean;
  variant?: "default" | "accent" | "danger";
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  const isAccent = variant === "accent";
  const isDanger = variant === "danger";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 34,
        minWidth: 38,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : isAccent
            ? premium.colors.border.accent
            : isDanger
              ? "rgba(239, 111, 145, 0.34)"
              : premium.colors.border.subtle,
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : isAccent
            ? premium.colors.accent.soft
            : isDanger
              ? premium.colors.state.failureSoft
              : pressed
                ? premium.colors.surface.pressed
                : premium.colors.surface.secondary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          { scale: pressed && !disabled ? premium.animation.pressScale : 1 },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? premium.colors.text.muted
            : isAccent
              ? premium.colors.accent.primary
              : isDanger
                ? premium.colors.state.failure
                : premium.colors.text.secondary,
          fontSize: 11,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepperButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : premium.colors.border.accent,
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : pressed
            ? premium.colors.surface.pressed
            : "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? premium.colors.text.muted
            : premium.colors.accent.primary,
          fontSize: 18,
          fontWeight: "900",
          lineHeight: 20,
          includeFontPadding: false,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepperRow({
  label,
  value,
  onMinus,
  onPlus,
  minusDisabled,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusDisabled?: boolean;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 164,
        minWidth: 164,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: premium.colors.border.subtle,
        backgroundColor: "rgba(255,255,255,0.045)",
        padding: 8,
        gap: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <StepperButton label="−" disabled={minusDisabled} onPress={onMinus} />

        <View
          style={{
            flex: 1,
            minWidth: 48,
            height: 34,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(232, 200, 120, 0.08)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 18,
              includeFontPadding: false,
              textAlign: "center",
            }}
          >
            {value}
          </Text>
        </View>

        <StepperButton label="+" onPress={onPlus} />
      </View>
    </View>
  );
}

export function Roll3DActionEntryAdjustmentCard({
  adjustment,
  compact = true,
  onChangeQty,
  onChangeModifier,
  onToggleSign,
  onClose,
}: Roll3DActionEntryAdjustmentCardProps) {
  const premium = usePremiumTheme();

  const modifierLabel =
    adjustment.modifier >= 0
      ? `+${adjustment.modifier}`
      : `${adjustment.modifier}`;

  const signLabel = adjustment.sign === -1 ? "−" : "+";

  return (
    <View
      style={{
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.18)",
        backgroundColor: "rgba(5, 6, 11, 0.72)",
        padding: compact ? 9 : 11,
        gap: 9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            Ajuster l’entrée
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.accent.primary,
              fontSize: 14,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {adjustment.entryLabel}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "800",
              marginTop: 2,
            }}
          >
            {adjustment.actionName}
          </Text>
        </View>

        <SmallButton label="×" variant="danger" onPress={onClose} />
      </View>

      <View
        style={{
          gap: 2,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
          }}
        >
          Base : {adjustment.technicalLabel}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "800",
          }}
        >
          Comportement : {adjustment.detail}
        </Text>

        <Text
          style={{
            color: premium.colors.text.muted,
            fontSize: 9,
            fontWeight: "700",
            lineHeight: 13,
          }}
        >
          Ces réglages seront appliqués au moment du lancer.
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: 8,
        }}
      >
        <StepperRow
          label="Quantité"
          value={`${adjustment.qty}`}
          minusDisabled={adjustment.qty <= 1}
          onMinus={() => onChangeQty(-1)}
          onPlus={() => onChangeQty(1)}
        />

        <StepperRow
          label="Modif. entrée"
          value={modifierLabel}
          onMinus={() => onChangeModifier(-1)}
          onPlus={() => onChangeModifier(1)}
        />

        <View
          style={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: 96,
            minWidth: 96,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor:
              adjustment.sign === -1
                ? "rgba(239, 111, 145, 0.32)"
                : "rgba(136, 211, 154, 0.28)",
            backgroundColor:
              adjustment.sign === -1
                ? premium.colors.state.failureSoft
                : premium.colors.state.successSoft,
            padding: 8,
            gap: 6,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Signe
          </Text>

          <SmallButton
            label={signLabel}
            variant={adjustment.sign === -1 ? "danger" : "accent"}
            onPress={onToggleSign}
          />
        </View>
      </View>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "800",
          lineHeight: 13,
        }}
      >
        Appuie sur LANCER pour jeter cette entrée ajustée.
      </Text>
    </View>
  );
}
