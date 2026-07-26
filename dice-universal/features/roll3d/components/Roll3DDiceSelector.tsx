// dice-universal/features/roll3d/components/Roll3DDiceSelector.tsx

import { useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";

type Roll3DDiceSelectorProps = {
  compact?: boolean;
  selectedSides: Roll3DDieSides;
  availableSides: Roll3DDieSides[];
  diceCount: number;
  maxDice: number;
  onSelectSides: (sides: Roll3DDieSides) => void;
  onAddMultipleDice: (params: {
    sides: Roll3DDieSides;
    quantity: number;
  }) => void;
  onClearDice?: () => void;
};

function getDieShortLabel(sides: Roll3DDieSides) {
  return `d${sides}`;
}

function getDieHint(sides: Roll3DDieSides) {
  if (sides === 100) return "centile";
  if (sides === 20) return "héroïque";
  if (sides === 12) return "large";
  if (sides === 10) return "décimal";
  if (sides === 8) return "stable";
  if (sides === 6) return "classique";
  if (sides === 4) return "léger";
  return "dé";
}

function DiceQuickButton({
  sides,
  selected,
  disabled,
  compact,
  onPress,
  onLongPress,
}: {
  sides: Roll3DDieSides;
  selected: boolean;
  disabled: boolean;
  compact: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const premium = usePremiumTheme();
  const longPressTriggeredRef = useRef(false);

  return (
    <Pressable
      disabled={disabled}
      delayLongPress={420}
      onPressIn={() => {
        longPressTriggeredRef.current = false;
      }}
      onLongPress={() => {
        longPressTriggeredRef.current = true;
        onLongPress();
      }}
      onPress={() => {
        if (longPressTriggeredRef.current) {
          longPressTriggeredRef.current = false;
          return;
        }

        onPress();
      }}
      onPressOut={() => {
        requestAnimationFrame(() => {
          longPressTriggeredRef.current = false;
        });
      }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.38 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          width: compact ? 54 : 62,
          minHeight: compact ? 54 : 62,
          borderRadius: compact ? 19 : 22,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.38)"
            : "rgba(255,255,255,0.075)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.14)"
            : "rgba(255,255,255,0.045)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 6,
          paddingVertical: 7,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.88)",
            fontSize: sides === 100 ? 14 : 16,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          {getDieShortLabel(sides)}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? "rgba(232, 200, 120, 0.62)"
              : "rgba(255,255,255,0.38)",
            fontSize: 8,
            fontWeight: "800",
            marginTop: 3,
          }}
        >
          {getDieHint(sides)}
        </Text>
      </View>
    </Pressable>
  );
}

function Roll3DDiceQuantityModal({
  visible,
  sides,
  quantity,
  maxQuantity,
  onChangeQuantity,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  sides: Roll3DDieSides | null;
  quantity: number;
  maxQuantity: number;
  onChangeQuantity: (quantity: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const premium = usePremiumTheme();

  if (!sides) {
    return null;
  }

  const decreaseQuantity = () => {
    onChangeQuantity(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    onChangeQuantity(Math.min(maxQuantity, quantity + 1));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.66)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.22)",
            backgroundColor: "rgba(10, 12, 22, 0.98)",
            padding: 18,
          }}
        >
          <Text
            style={{
              color: premium.colors.accent.primary,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            Ajout rapide
          </Text>

          <Text
            style={{
              color: premium.colors.text.primary,
              fontSize: 24,
              fontWeight: "900",
              textAlign: "center",
              marginTop: 6,
            }}
          >
            Ajouter des d{sides}
          </Text>

          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 11,
              fontWeight: "700",
              textAlign: "center",
              marginTop: 5,
            }}
          >
            {maxQuantity} emplacement
            {maxQuantity > 1 ? "s" : ""} disponible
            {maxQuantity > 1 ? "s" : ""}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginTop: 20,
            }}
          >
            <Pressable
              disabled={quantity <= 1}
              onPress={decreaseQuantity}
              style={({ pressed }) => ({
                opacity: quantity <= 1 ? 0.36 : pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.primary,
                    fontSize: 24,
                    fontWeight: "900",
                  }}
                >
                  −
                </Text>
              </View>
            </Pressable>

            <View
              style={{
                minWidth: 92,
                minHeight: 70,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(232, 200, 120, 0.30)",
                backgroundColor: "rgba(232, 200, 120, 0.10)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 30,
                  fontWeight: "900",
                }}
              >
                {quantity}
              </Text>

              <Text
                style={{
                  color: "rgba(232, 200, 120, 0.60)",
                  fontSize: 9,
                  fontWeight: "900",
                  textTransform: "uppercase",
                }}
              >
                dé{quantity > 1 ? "s" : ""}
              </Text>
            </View>

            <Pressable
              disabled={quantity >= maxQuantity}
              onPress={increaseQuantity}
              style={({ pressed }) => ({
                opacity: quantity >= maxQuantity ? 0.36 : pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.primary,
                    fontSize: 24,
                    fontWeight: "900",
                  }}
                >
                  +
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  minHeight: 44,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.09)",
                  backgroundColor: "rgba(255,255,255,0.045)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.secondary,
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  Annuler
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => ({
                flex: 1.35,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <View
                style={{
                  minHeight: 44,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(232, 200, 120, 0.30)",
                  backgroundColor: "rgba(232, 200, 120, 0.14)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.accent.primary,
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  Ajouter {quantity}d{sides}
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Roll3DDiceSelector({
  compact = true,
  selectedSides,
  availableSides,
  diceCount,
  maxDice,
  onSelectSides,
  onAddMultipleDice,
  onClearDice,
}: Roll3DDiceSelectorProps) {
  const premium = usePremiumTheme();

  const [quantitySides, setQuantitySides] = useState<Roll3DDieSides | null>(
    null,
  );

  const [quantity, setQuantity] = useState(2);

  const remainingSlots = Math.max(0, maxDice - diceCount);

  const quickQuantityMax = useMemo(
    () => Math.max(1, remainingSlots),
    [remainingSlots],
  );

  const limitReached = diceCount >= maxDice;
  const hasDice = diceCount > 0;

  function openQuantityModal(sides: Roll3DDieSides) {
    if (remainingSlots <= 0) {
      return;
    }

    setQuantitySides(sides);
    setQuantity(Math.min(2, remainingSlots));
  }

  function closeQuantityModal() {
    setQuantitySides(null);
    setQuantity(2);
  }

  function confirmQuantity() {
    if (!quantitySides || remainingSlots <= 0) {
      closeQuantityModal();
      return;
    }

    onAddMultipleDice({
      sides: quantitySides,
      quantity: Math.min(quantity, remainingSlots),
    });

    closeQuantityModal();
  }

  return (
    <View
      style={{
        width: "100%",
        gap: 9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: "rgba(255,255,255,0.54)",
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            Dés libres
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: hasDice
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.82)",
              fontSize: 12,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {hasDice
              ? `${diceCount} dé${diceCount > 1 ? "s" : ""} dans la Main actuelle`
              : "Ajoute un dé à la Main actuelle"}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: limitReached
              ? "rgba(239, 111, 145, 0.24)"
              : "rgba(255,255,255,0.09)",
            backgroundColor: limitReached
              ? "rgba(239, 111, 145, 0.08)"
              : "rgba(255,255,255,0.045)",
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: limitReached
                ? "rgba(239, 111, 145, 0.92)"
                : "rgba(255,255,255,0.68)",
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            {diceCount} / {maxDice}
          </Text>
        </View>

        {onClearDice ? (
          <Pressable
            disabled={!hasDice}
            onPress={onClearDice}
            style={({ pressed }) => ({
              opacity: !hasDice ? 0.42 : pressed ? 0.76 : 1,
              transform: [{ scale: pressed && hasDice ? 0.985 : 1 }],
            })}
          >
            <View
              style={{
                minHeight: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: hasDice
                  ? "rgba(239, 111, 145, 0.28)"
                  : "rgba(255,255,255,0.06)",
                backgroundColor: hasDice
                  ? "rgba(239, 111, 145, 0.08)"
                  : "rgba(255,255,255,0.025)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: hasDice
                    ? "rgba(239, 111, 145, 0.92)"
                    : "rgba(255,255,255,0.34)",
                  fontSize: 9,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Vider
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 2,
          paddingVertical: 2,
        }}
      >
        {availableSides.map((sides) => (
          <DiceQuickButton
            key={`roll-3d-free-die-${sides}`}
            sides={sides}
            selected={sides === selectedSides}
            disabled={limitReached}
            compact={compact}
            onPress={() => onSelectSides(sides)}
            onLongPress={() => openQuantityModal(sides)}
          />
        ))}
      </ScrollView>

      {limitReached ? (
        <View
          style={{
            borderRadius: 18,
            backgroundColor: "rgba(239, 111, 145, 0.075)",
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: "rgba(239, 111, 145, 0.92)",
              fontSize: 10,
              fontWeight: "800",
              lineHeight: 14,
            }}
          >
            Limite atteinte pour cette Main. Lance les dés présents ou vide la
            table pour composer une nouvelle Main.
          </Text>
        </View>
      ) : null}

      <Roll3DDiceQuantityModal
        visible={!!quantitySides}
        sides={quantitySides}
        quantity={quantity}
        maxQuantity={quickQuantityMax}
        onChangeQuantity={setQuantity}
        onClose={closeQuantityModal}
        onConfirm={confirmQuantity}
      />
    </View>
  );
}
