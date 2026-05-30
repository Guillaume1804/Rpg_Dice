// dice-universal/components/premium/PremiumOverlayTextInput.tsx

import { useEffect, useState } from "react";
import { Pressable, Text, View, type TextInputProps } from "react-native";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";
import { PremiumKeyboardInputOverlay } from "./PremiumKeyboardInputOverlay";

type PremiumOverlayTextInputProps = {
  label: string;
  value: string;
  mode?: "text" | "number" | "number_list";
  onChangeText: (value: string) => void;
  placeholder?: string;
  numericOnly?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  inputMode?: TextInputProps["inputMode"];
  autoFocus?: boolean;
};

export function PremiumOverlayTextInput({
  label,
  value,
  mode,
  onChangeText,
  placeholder,
  numericOnly,
  keyboardType,
  inputMode,
  autoFocus,
}: PremiumOverlayTextInputProps) {
  const premium = usePremiumTheme();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (!overlayVisible) {
      setDraftValue(value);
    }
  }, [value, overlayVisible]);

  useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
      setDraftValue(value);
      setOverlayVisible(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [autoFocus, value]);

  const shouldUseNumericKeyboard =
    numericOnly || keyboardType === "numeric" || keyboardType === "number-pad";

  const resolvedKeyboardType = shouldUseNumericKeyboard
    ? "number-pad"
    : (keyboardType ?? "default");

  const resolvedInputMode =
    inputMode ?? (shouldUseNumericKeyboard ? "numeric" : undefined);

  const resolvedMode = mode ?? (numericOnly ? "number" : "text");

  return (
    <View style={{ gap: premium.spacing.xs }}>
      <Text
        style={{
          color: premium.colors.text.secondary,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>

      <Pressable
        onPress={() => {
          setDraftValue(value);
          setOverlayVisible(true);
        }}
        style={({ pressed }) => ({
          minHeight: 50,
          justifyContent: "center",
          backgroundColor: premium.colors.surface.subtle,
          borderWidth: 1,
          borderColor: overlayVisible
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
          borderRadius: premium.radius.lg,
          paddingHorizontal: 14,
          paddingVertical: 11,
          opacity: pressed ? 0.86 : 1,
          transform: [
            {
              scale: pressed ? premium.animation.pressScale : 1,
            },
          ],
        })}
      >
        <Text
          numberOfLines={1}
          style={{
            color: value
              ? premium.colors.text.primary
              : premium.colors.text.muted,
            fontSize: 16,
            fontWeight: "800",
          }}
        >
          {value || placeholder || "Saisir une valeur"}
        </Text>
      </Pressable>

      <PremiumKeyboardInputOverlay
        visible={overlayVisible}
        label={label}
        value={draftValue}
        mode={resolvedMode}
        placeholder={placeholder}
        keyboardType={resolvedKeyboardType}
        inputMode={resolvedInputMode}
        onChangeText={setDraftValue}
        onCancel={() => {
          setDraftValue(value);
          setOverlayVisible(false);
        }}
        onConfirm={() => {
          onChangeText(draftValue);
          setOverlayVisible(false);
        }}
      />
    </View>
  );
}
