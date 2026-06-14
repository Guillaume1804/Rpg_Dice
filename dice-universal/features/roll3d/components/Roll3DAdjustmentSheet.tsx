import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryAdjustment } from "../types";
import {
  Roll3DActionEntryAdjustmentCard,
  type Roll3DAdjustmentSection,
} from "./Roll3DActionEntryAdjustmentCard";

type Roll3DAdjustmentSheetProps = {
  visible: boolean;
  adjustment: Roll3DActionEntryAdjustment | null;
  onClose: () => void;
  onChangeQty: (delta: number) => void;
  onChangeModifier: (delta: number) => void;
  onToggleSign: () => void;
  onChangeBehaviorParam: (params: {
    paramsKey: string;
    value: unknown;
  }) => void;
};

function getAdjustmentSectionLabel(section: Roll3DAdjustmentSection) {
  if (section === "dice") return "Dés";
  if (section === "behavior") return "Règle";
  return "Tout";
}

export function Roll3DAdjustmentSheet({
  visible,
  adjustment,
  onClose,
  onChangeQty,
  onChangeModifier,
  onToggleSign,
  onChangeBehaviorParam,
}: Roll3DAdjustmentSheetProps) {
  const premium = usePremiumTheme();

  const [activeSection, setActiveSection] =
    useState<Roll3DAdjustmentSection>("dice");

  useEffect(() => {
    if (visible) {
      setActiveSection("dice");
    }
  }, [visible, adjustment?.entryId]);

  if (!adjustment) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.60)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 430,
            maxHeight: "84%",
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(6, 8, 18, 0.985)",
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 14,
            gap: 10,
          }}
        >

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 11,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.1,
                }}
              >
                Ajuster le jet
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 17,
                  fontWeight: "900",
                  marginTop: 3,
                }}
              >
                {adjustment.entryLabel}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 11,
                  fontWeight: "800",
                  marginTop: 3,
                }}
              >
                {adjustment.actionName}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.74 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(239, 111, 145, 0.32)",
                  backgroundColor: "rgba(239, 111, 145, 0.10)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.state.failure,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  ×
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 7,
            }}
          >
            {(["dice", "behavior", "all"] as const).map((section) => {
              const selected = activeSection === section;

              return (
                <Pressable
                  key={`roll-3d-adjustment-section-${section}`}
                  onPress={() => setActiveSection(section)}
                  style={({ pressed }) => ({
                    flex: 1,
                    opacity: pressed ? 0.82 : 1,
                    transform: [
                      {
                        scale: pressed ? premium.animation.pressScale : 1,
                      },
                    ],
                  })}
                >
                  <View
                    style={{
                      minHeight: 34,
                      borderRadius: premium.radius.pill,
                      borderWidth: 1,
                      borderColor: selected
                        ? premium.colors.border.accent
                        : premium.colors.border.subtle,
                      backgroundColor: selected
                        ? premium.colors.accent.soft
                        : "rgba(255,255,255,0.045)",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: selected
                          ? premium.colors.accent.primary
                          : premium.colors.text.secondary,
                        fontSize: 10,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                      }}
                    >
                      {getAdjustmentSectionLabel(section)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Roll3DActionEntryAdjustmentCard
            compact
            adjustment={adjustment}
            section={activeSection}
            onChangeQty={onChangeQty}
            onChangeModifier={onChangeModifier}
            onToggleSign={onToggleSign}
            onChangeBehaviorParam={onChangeBehaviorParam}
            onClose={onClose}
            hideHeader
          />

          <View
            style={{
              borderRadius: premium.radius.lg,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.12)",
              backgroundColor: "rgba(232, 200, 120, 0.055)",
              paddingHorizontal: 11,
              paddingVertical: 9,
            }}
          >
            <Text
              style={{
                color: premium.colors.text.secondary,
                fontSize: 11,
                fontWeight: "800",
                lineHeight: 16,
              }}
            >
              Les réglages restent temporaires tant que tu ne sauvegardes pas
              l’action. Ferme ce panneau puis lance le jet ajusté.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
