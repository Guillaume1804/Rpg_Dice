import { Modal, Pressable, Text, View } from "react-native";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type Props = {
  visible: boolean;
  allowedDice: number[];
  selectedSides: number;
  quantity: number;
  modifier: number;
  lastRolls: number[];
  resultText: string | null;
  error: string | null;

  onClose: () => void;
  onSelectSides: (sides: number) => void;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  onIncrementModifier: () => void;
  onDecrementModifier: () => void;
  onRollPreview: () => void;
};

function HeaderPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.28)",
        backgroundColor: "rgba(232, 200, 120, 0.09)",
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          color: premium.colors.accent.primary,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.85,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PillButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const premium = usePremiumTheme();

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 42,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: isAccent
            ? "rgba(232, 200, 120, 0.30)"
            : "rgba(255,255,255,0.10)",
          backgroundColor: isAccent
            ? "rgba(232, 200, 120, 0.12)"
            : "rgba(255,255,255,0.055)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            color: isAccent
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.70)",
            fontSize: 12,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: "rgba(255,255,255,0.58)",
          fontSize: 11,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.55,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <PillButton label="−" onPress={onMinus} />

        <View
          style={{
            minWidth: 64,
            minHeight: 42,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.09)",
            backgroundColor: "rgba(255,255,255,0.055)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.92)",
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            {value}
          </Text>
        </View>

        <PillButton label="+" onPress={onPlus} />
      </View>
    </View>
  );
}

export function GuidedBehaviorPreviewModal({
  visible,
  allowedDice,
  selectedSides,
  quantity,
  modifier,
  lastRolls,
  resultText,
  error,
  onClose,
  onSelectSides,
  onIncrementQuantity,
  onDecrementQuantity,
  onIncrementModifier,
  onDecrementModifier,
  onRollPreview,
}: Props) {
  const premium = usePremiumTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.72)",
          justifyContent: "center",
          padding: premium.spacing.md,
        }}
      >
        <View
          style={{
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(6, 8, 18, 0.98)",
            padding: premium.spacing.md,
            gap: premium.spacing.md,
          }}
        >
          <View style={{ gap: 8 }}>
            <HeaderPill label="Aperçu" />

            <Text
              style={{
                color: "rgba(255,255,255,0.96)",
                fontSize: 23,
                fontWeight: "900",
                letterSpacing: -0.35,
              }}
            >
              Tester le comportement
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.60)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 17,
              }}
            >
              Choisis un dé, une quantité et un modificateur, puis lance un
              aperçu pour vérifier le comportement.
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.58)",
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.55,
              }}
            >
              Dé
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {allowedDice.map((side) => {
                const selected = selectedSides === side;

                return (
                  <Pressable
                    key={side}
                    onPress={() => onSelectSides(side)}
                    style={({ pressed }) => ({
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
                        minWidth: 54,
                        minHeight: 40,
                        borderRadius: premium.radius.pill,
                        borderWidth: 1,
                        borderColor: selected
                          ? "rgba(232, 200, 120, 0.32)"
                          : "rgba(255,255,255,0.09)",
                        backgroundColor: selected
                          ? "rgba(232, 200, 120, 0.12)"
                          : "rgba(255,255,255,0.05)",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: selected
                            ? premium.colors.accent.primary
                            : "rgba(255,255,255,0.68)",
                          fontSize: 12,
                          fontWeight: "900",
                        }}
                      >
                        d{side}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap" }}>
            <Stepper
              label="Quantité"
              value={quantity}
              onMinus={onDecrementQuantity}
              onPlus={onIncrementQuantity}
            />

            <Stepper
              label="Modificateur"
              value={modifier}
              onMinus={onDecrementModifier}
              onPlus={onIncrementModifier}
            />
          </View>

          <PillButton
            label="Lancer un aperçu"
            onPress={onRollPreview}
            variant="accent"
          />

          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.045)",
              paddingHorizontal: 13,
              paddingVertical: 13,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.58)",
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Résultat test
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.94)",
                fontSize: 17,
                fontWeight: "900",
              }}
            >
              {lastRolls.length > 0
                ? `${quantity}d${selectedSides} : ${lastRolls.join(" + ")}`
                : `${quantity}d${selectedSides}`}
              {modifier !== 0
                ? ` ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`
                : ""}
            </Text>

            {error ? (
              <Text
                style={{
                  color: premium.colors.state.failure,
                  fontSize: 12,
                  fontWeight: "800",
                  lineHeight: 17,
                }}
              >
                {error}
              </Text>
            ) : (
              <Text
                style={{
                  color: "rgba(255,255,255,0.66)",
                  fontSize: 12,
                  fontWeight: "700",
                  lineHeight: 18,
                }}
              >
                {resultText ?? "Aucun lancer d’aperçu pour le moment."}
              </Text>
            )}
          </View>

          <PillButton label="Fermer" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
