// dice-universal/components/premium/PremiumBottomSheet.tsx

import { useEffect, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";
import { PremiumPressable } from "./PremiumPressable";
import { PremiumText } from "./PremiumText";

type PremiumBottomSheetMaxHeight = number | `${number}%`;

type PremiumBottomSheetProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  maxHeight?: PremiumBottomSheetMaxHeight;
};

export function PremiumBottomSheet({
  visible,
  title,
  subtitle,
  children,
  onClose,
  footer,
  maxHeight = "84%",
}: PremiumBottomSheetProps) {
  const premium = usePremiumTheme();

  const insets = useSafeAreaInsets();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const safeBottomPadding = Math.max(
    insets.bottom + premium.spacing.md,
    premium.spacing.lg,
  );

  const keyboardOffset = Math.max(keyboardHeight - insets.bottom, 0);

  useEffect(() => {
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

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={premium.animation.normal <= 0 ? "none" : "fade"}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: premium.colors.background.overlay,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              flex: 1,
            }}
          />

          <View
            style={{
              maxHeight,
              marginBottom: keyboardOffset,
              borderTopLeftRadius: premium.radius.xxl,
              borderTopRightRadius: premium.radius.xxl,
              borderWidth: 1,
              borderColor: premium.colors.border.subtle,
              backgroundColor: premium.colors.background.secondary,
              paddingTop: premium.spacing.sm,
              paddingHorizontal: premium.spacing.md,
              paddingBottom: safeBottomPadding,
              ...premium.shadow.card,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 42,
                height: 4,
                borderRadius: premium.radius.pill,
                backgroundColor: premium.colors.border.strong,
                marginBottom: premium.spacing.md,
                opacity: 0.72,
              }}
            />

            {title || subtitle ? (
              <View
                style={{
                  marginBottom: premium.spacing.md,
                  gap: premium.spacing.xs,
                }}
              >
                {title ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: premium.spacing.md,
                    }}
                  >
                    <PremiumText variant="title">{title}</PremiumText>

                    <PremiumPressable
                      onPress={onClose}
                      hitSlop={10}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: premium.radius.pill,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: premium.colors.surface.subtle,
                        borderWidth: 1,
                        borderColor: premium.colors.border.subtle,
                      }}
                    >
                      <Text
                        style={{
                          color: premium.colors.text.secondary,
                          fontSize: 18,
                          fontWeight: "900",
                          lineHeight: 20,
                        }}
                      >
                        ×
                      </Text>
                    </PremiumPressable>
                  </View>
                ) : null}

                {subtitle ? (
                  <PremiumText variant="body" tone="secondary">
                    {subtitle}
                  </PremiumText>
                ) : null}
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              contentContainerStyle={{
                paddingBottom:
                  keyboardHeight > 0
                    ? premium.spacing.lg
                    : footer
                      ? premium.spacing.sm
                      : 0,
              }}
            >
              {children}
            </ScrollView>

            {footer ? (
              <View
                style={{
                  paddingTop: premium.spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: premium.colors.border.subtle,
                }}
              >
                {footer}
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
