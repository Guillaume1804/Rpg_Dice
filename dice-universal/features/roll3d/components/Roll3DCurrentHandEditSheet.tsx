import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DSavableDraftLine } from "../logic/roll3DDraft";

type Roll3DCurrentHandEditSheetProps = {
  visible: boolean;
  lines: Roll3DSavableDraftLine[];
  diceCount: number;
  maxDice: number;
  onClose: () => void;
  onApply: () => void;
  onChangeQty: (lineKey: string, delta: number) => void;
  onChangeModifier: (lineKey: string, delta: number) => void;
  onToggleSign: (lineKey: string) => void;
  onRemoveLine: (lineKey: string) => void;
};

function formatLineFormula(line: Roll3DSavableDraftLine) {
  const signedPrefix = line.sign === -1 ? "− " : "";

  const modifier =
    line.modifier === 0
      ? ""
      : line.modifier > 0
        ? ` + ${line.modifier}`
        : ` − ${Math.abs(line.modifier)}`;

  return `${signedPrefix}${line.qty}d${line.sides}${modifier}`;
}

function SmallStepButton({
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
        opacity: disabled ? 0.36 : pressed ? 0.72 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          backgroundColor: premium.colors.surface.subtle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ValueControl({
  label,
  value,
  disableDecrease,
  disableIncrease,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: string;
  disableDecrease?: boolean;
  disableIncrease?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <View style={{ flex: 1, minWidth: 128, gap: 6 }}>
      <Text
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
          minHeight: 40,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: premium.colors.border.subtle,
          backgroundColor: "rgba(255,255,255,0.035)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 4,
        }}
      >
        <SmallStepButton
          label="−"
          disabled={disableDecrease}
          onPress={onDecrease}
        />

        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 13,
            fontWeight: "900",
            textAlign: "center",
            minWidth: 36,
          }}
        >
          {value}
        </Text>

        <SmallStepButton
          label="+"
          disabled={disableIncrease}
          onPress={onIncrease}
        />
      </View>
    </View>
  );
}

function CurrentHandLineCard({
  line,
  totalDiceCount,
  maxDice,
  onChangeQty,
  onChangeModifier,
  onToggleSign,
  onRemove,
}: {
  line: Roll3DSavableDraftLine;
  totalDiceCount: number;
  maxDice: number;
  onChangeQty: (delta: number) => void;
  onChangeModifier: (delta: number) => void;
  onToggleSign: () => void;
  onRemove: () => void;
}) {
  const premium = usePremiumTheme();

  const canIncreaseQuantity = totalDiceCount < maxDice;

  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.075)",
        backgroundColor: "rgba(255,255,255,0.04)",
        padding: 12,
        gap: 12,
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
              color: premium.colors.text.primary,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            {line.label ?? formatLineFormula(line)}
          </Text>

          <Text
            style={{
              color: premium.colors.accent.primary,
              fontSize: 12,
              fontWeight: "900",
              marginTop: 3,
            }}
          >
            {formatLineFormula(line)}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 10,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            {line.behaviorLabel ?? "Somme simple"}
          </Text>
        </View>

        <Pressable
          onPress={onRemove}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            transform: [
              {
                scale: pressed ? premium.animation.pressScale : 1,
              },
            ],
          })}
        >
          <View
            style={{
              minHeight: 32,
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(239, 111, 145, 0.28)",
              backgroundColor: "rgba(239, 111, 145, 0.09)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                color: premium.colors.state.failure,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
              }}
            >
              Retirer
            </Text>
          </View>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 9,
        }}
      >
        <ValueControl
          label="Quantité"
          value={String(line.qty)}
          disableDecrease={line.qty <= 1}
          disableIncrease={!canIncreaseQuantity}
          onDecrease={() => onChangeQty(-1)}
          onIncrease={() => onChangeQty(1)}
        />

        <ValueControl
          label="Modificateur"
          value={
            line.modifier > 0 ? `+${line.modifier}` : String(line.modifier)
          }
          disableDecrease={line.modifier <= -99}
          disableIncrease={line.modifier >= 99}
          onDecrease={() => onChangeModifier(-1)}
          onIncrease={() => onChangeModifier(1)}
        />
      </View>

      <Pressable
        onPress={onToggleSign}
        style={({ pressed }) => ({
          opacity: pressed ? 0.76 : 1,
          transform: [
            {
              scale: pressed ? premium.animation.pressScale : 1,
            },
          ],
        })}
      >
        <View
          style={{
            minHeight: 40,
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor:
              line.sign === -1
                ? "rgba(239, 111, 145, 0.30)"
                : "rgba(136, 211, 154, 0.28)",
            backgroundColor:
              line.sign === -1
                ? "rgba(239, 111, 145, 0.09)"
                : "rgba(136, 211, 154, 0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color:
                line.sign === -1
                  ? premium.colors.state.failure
                  : premium.colors.state.success,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            {line.sign === -1 ? "Signe négatif" : "Signe positif"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export function Roll3DCurrentHandEditSheet({
  visible,
  lines,
  diceCount,
  maxDice,
  onClose,
  onApply,
  onChangeQty,
  onChangeModifier,
  onToggleSign,
  onRemoveLine,
}: Roll3DCurrentHandEditSheetProps) {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();

  const canApply = lines.length > 0 && diceCount > 0;

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
          backgroundColor: "rgba(0,0,0,0.64)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: Math.max(24, insets.top + 14),
          paddingBottom: Math.max(24, insets.bottom + 14),
        }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            width: "100%",
            maxWidth: 440,
            maxHeight: "90%",
            borderRadius: 32,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.16)",
            backgroundColor: "rgba(6, 8, 18, 0.98)",
            padding: 14,
            gap: 12,
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
                  letterSpacing: 1.1,
                }}
              >
                Main actuelle
              </Text>

              <Text
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 22,
                  fontWeight: "900",
                  marginTop: 3,
                }}
              >
                Modifier la Main
              </Text>

              <Text
                style={{
                  color: premium.colors.text.muted,
                  fontSize: 11,
                  fontWeight: "700",
                  marginTop: 4,
                }}
              >
                {diceCount} dé{diceCount > 1 ? "s" : ""} · {lines.length} ligne
                {lines.length > 1 ? "s" : ""}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  minHeight: 34,
                  borderRadius: premium.radius.pill,
                  borderWidth: 1,
                  borderColor: premium.colors.border.subtle,
                  backgroundColor: premium.colors.surface.subtle,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: premium.colors.text.secondary,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  Annuler
                </Text>
              </View>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 10,
              paddingBottom: 4,
            }}
          >
            {lines.map((line) => (
              <CurrentHandLineCard
                key={line.key}
                line={line}
                totalDiceCount={diceCount}
                maxDice={maxDice}
                onChangeQty={(delta) => onChangeQty(line.key, delta)}
                onChangeModifier={(delta) => onChangeModifier(line.key, delta)}
                onToggleSign={() => onToggleSign(line.key)}
                onRemove={() => onRemoveLine(line.key)}
              />
            ))}
          </ScrollView>

          <Pressable
            disabled={!canApply}
            onPress={onApply}
            style={({ pressed }) => ({
              opacity: !canApply ? 0.4 : pressed ? 0.78 : 1,
              transform: [
                {
                  scale: pressed && canApply ? premium.animation.pressScale : 1,
                },
              ],
            })}
          >
            <View
              style={{
                minHeight: 48,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(232, 200, 120, 0.32)",
                backgroundColor: "rgba(232, 200, 120, 0.14)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Appliquer à la Main
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
