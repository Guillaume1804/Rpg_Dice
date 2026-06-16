// dice-universal/features/roll3d/components/Roll3DAdjustmentSheet.tsx

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
  onApply: () => void;
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
  return "Règle";
}

export function Roll3DAdjustmentSheet({
  visible,
  adjustment,
  onClose,
  onApply,
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
            borderRadius: 32,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.14)",
            backgroundColor: "rgba(6, 8, 18, 0.94)",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 14,
            gap: 11,
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
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Ajuster le jet
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 3,
                  letterSpacing: -0.4,
                }}
              >
                {adjustment.entryLabel}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 7,
                  marginTop: 7,
                }}
              >
                <Pressable
                  onPress={onApply}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.84 : 1,
                    transform: [
                      {
                        scale: pressed ? premium.animation.pressScale : 1,
                      },
                    ],
                  })}
                >
                  <View
                    style={{
                      minHeight: 48,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(232, 200, 120, 0.34)",
                      backgroundColor: "rgba(232, 200, 120, 0.16)",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: premium.colors.accent.primary,
                        fontSize: 12,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.9,
                      }}
                    >
                      Appliquer au jet
                    </Text>
                  </View>
                </Pressable>

                <View
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "rgba(232, 200, 120, 0.14)",
                    backgroundColor: "rgba(232, 200, 120, 0.055)",
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: premium.colors.accent.primary,
                      fontSize: 9,
                      fontWeight: "900",
                    }}
                  >
                    non sauvegardé
                  </Text>
                </View>
              </View>
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
                  minWidth: 78,
                  height: 34,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(239, 111, 145, 0.28)",
                  backgroundColor: "rgba(239, 111, 145, 0.09)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.state.failure,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Annuler
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.07)",
              backgroundColor: "rgba(255,255,255,0.035)",
              padding: 4,
            }}
          >
            {(["dice", "behavior"] as Roll3DAdjustmentSection[]).map((section) => {
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
                      borderRadius: 999,
                      borderWidth: selected ? 1 : 0,
                      borderColor: selected
                        ? "rgba(232, 200, 120, 0.30)"
                        : "transparent",
                      backgroundColor: selected
                        ? "rgba(232, 200, 120, 0.16)"
                        : "transparent",
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
                        letterSpacing: 0.8,
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
              borderRadius: 22,
              borderWidth: 0,
              backgroundColor: "rgba(255,255,255,0.045)",
              paddingHorizontal: 12,
              paddingVertical: 10,
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
              Applique ces réglages au jet, puis lance depuis la table. Tu
              pourras sauvegarder la variante après le résultat.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
