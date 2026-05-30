// dice-universal/components/premium/PremiumKeyboardInputOverlay.tsx

import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInput as TextInputType,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type PremiumKeyboardInputOverlayProps = {
  visible: boolean;
  label: string;
  value: string;
  placeholder?: string;
  mode?: "text" | "number" | "number_list";
  keyboardType?: TextInputProps["keyboardType"];
  inputMode?: TextInputProps["inputMode"];
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function NumericKey({
  label,
  onPress,
  wide,
  danger,
}: {
  label: string;
  onPress: () => void;
  wide?: boolean;
  danger?: boolean;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: wide ? 2 : 1,
        minHeight: 46,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: danger
          ? "rgba(239, 111, 145, 0.38)"
          : premium.colors.border.subtle,
        backgroundColor: danger
          ? premium.colors.state.failureSoft
          : pressed
            ? premium.colors.surface.pressed
            : premium.colors.surface.subtle,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <Text
        style={{
          color: danger
            ? premium.colors.state.failure
            : premium.colors.text.primary,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PremiumNumericKeypad({
  value,
  mode,
  onChangeText,
  onDone,
}: {
  value: string;
  mode: "number" | "number_list";
  onChangeText: (value: string) => void;
  onDone: () => void;
}) {
  const premium = usePremiumTheme();

  function append(char: string) {
    if (char === ",") {
      if (mode !== "number_list") return;
      if (!value) return;
      if (value.endsWith(",")) return;
    }

    onChangeText(`${value}${char}`);
  }

  function backspace() {
    onChangeText(value.slice(0, -1));
  }

  return (
    <View style={{ gap: premium.spacing.sm }}>
      <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
        <NumericKey label="1" onPress={() => append("1")} />
        <NumericKey label="2" onPress={() => append("2")} />
        <NumericKey label="3" onPress={() => append("3")} />
      </View>

      <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
        <NumericKey label="4" onPress={() => append("4")} />
        <NumericKey label="5" onPress={() => append("5")} />
        <NumericKey label="6" onPress={() => append("6")} />
      </View>

      <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
        <NumericKey label="7" onPress={() => append("7")} />
        <NumericKey label="8" onPress={() => append("8")} />
        <NumericKey label="9" onPress={() => append("9")} />
      </View>

      <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
        {mode === "number_list" ? (
          <NumericKey label="," onPress={() => append(",")} />
        ) : (
          <NumericKey label="Vider" onPress={() => onChangeText("")} danger />
        )}

        <NumericKey label="0" onPress={() => append("0")} />

        <NumericKey label="⌫" onPress={backspace} />
      </View>

      {mode === "number_list" ? (
        <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
          <NumericKey label="Vider" onPress={() => onChangeText("")} danger />
          <NumericKey label="Terminé" onPress={onDone} wide />
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: premium.spacing.sm }}>
          <NumericKey label="Terminé" onPress={onDone} wide />
        </View>
      )}
    </View>
  );
}

export function PremiumKeyboardInputOverlay({
  visible,
  label,
  value,
  placeholder,
  mode = "text",
  keyboardType = "default",
  inputMode,
  onChangeText,
  onCancel,
  onConfirm,
}: PremiumKeyboardInputOverlayProps) {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const inputRef = useRef<TextInputType | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const isNumericOverlay = mode === "number" || mode === "number_list";

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    const focusTimer = setTimeout(() => {
      if (!isNumericOverlay) {
        inputRef.current?.focus();
      }
    }, 80);

    return () => {
      clearTimeout(focusTimer);
      showSub.remove();
      hideSub.remove();
    };
  }, [visible, isNumericOverlay]);

  function handleCancel() {
    Keyboard.dismiss();
    onCancel();
  }

  function handleConfirm() {
    Keyboard.dismiss();
    onConfirm();
  }

  const keyboardTop =
    keyboardHeight > 0 ? windowHeight - keyboardHeight : windowHeight;

  const minTop = Math.max(insets.top + premium.spacing.lg, 64);

  const estimatedOverlayHeight = 118;

  /**
   * Zone visible au-dessus du clavier.
   * On place l’overlay dans le bas de cette zone,
   * mais avec une marge confortable au-dessus du clavier.
   */
  const visibleAreaHeight =
    keyboardHeight > 0 ? keyboardTop - minTop : windowHeight;

  const desiredTop =
    keyboardHeight > 0
      ? minTop + visibleAreaHeight * 0.55
      : windowHeight * 0.36;

  const maxTop =
    keyboardHeight > 0
      ? keyboardTop - estimatedOverlayHeight - premium.spacing.xl
      : windowHeight * 0.48;

  const overlayTop = Math.min(Math.max(desiredTop, minTop), maxTop);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        }}
      >
        <Pressable
          onPress={handleCancel}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        <View
          style={{
            position: "absolute",
            top: overlayTop,
            left: premium.spacing.md,
            right: premium.spacing.md,
            borderRadius: premium.radius.xl,
            borderWidth: 1,
            borderColor: premium.colors.accent.primary,
            backgroundColor: premium.colors.surface.elevated,
            padding: premium.spacing.md,
            gap: premium.spacing.sm,
            ...premium.shadow.card,
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
            {label}
          </Text>

          {isNumericOverlay ? (
            <>
              <View
                style={{
                  minHeight: 52,
                  justifyContent: "center",
                  backgroundColor: premium.colors.surface.subtle,
                  borderWidth: 1,
                  borderColor: premium.colors.border.subtle,
                  borderRadius: premium.radius.lg,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: value
                      ? premium.colors.text.primary
                      : premium.colors.text.muted,
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  {value || placeholder || "Saisir une valeur"}
                </Text>
              </View>

              <PremiumNumericKeypad
                value={value}
                mode={mode}
                onChangeText={onChangeText}
                onDone={handleConfirm}
              />
            </>
          ) : (
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={premium.colors.text.muted}
              keyboardType={keyboardType}
              inputMode={inputMode}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={handleConfirm}
              selectionColor={premium.colors.accent.primary}
              style={{
                minHeight: 52,
                color: premium.colors.text.primary,
                backgroundColor: premium.colors.surface.subtle,
                borderWidth: 1,
                borderColor: premium.colors.border.subtle,
                borderRadius: premium.radius.lg,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 17,
                fontWeight: "800",
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
