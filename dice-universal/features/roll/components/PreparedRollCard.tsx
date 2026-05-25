// dice-universal/features/roll/components/PreparedRollCard.tsx

import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

export type PreparedRollCardLine = {
  id: string;
  label: string;
  detail?: string | null;
  sign?: number;

  /**
   * Données visuelles séparées du texte.
   * Important pour remplacer plus tard les glyphes par :
   * - images de dés
   * - sprites 2D
   * - mini dés 3D
   */
  sides?: number;
  qty?: number;
  modifier?: number;
  hasBehavior?: boolean;
};

type PreparedRollCardProps = {
  title?: string;
  name: string | null;
  detail: string | null;
  lines?: PreparedRollCardLine[];
  isEmpty: boolean;
  onEdit?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  onAdjustLineQty?: (index: number, delta: number) => void;
  onAdjustLineModifier?: (index: number, delta: number) => void;
  onToggleLineSign?: (index: number) => void;
  onRemoveLine?: (index: number) => void;
  onConfigureLineBehavior?: (index: number) => void;
};

function getDieShapeLabel(sides?: number) {
  if (sides === 4) return "△";
  if (sides === 6) return "□";
  if (sides === 8) return "◇";
  if (sides === 10) return "⬟";
  if (sides === 12) return "⬢";
  if (sides === 20) return "✦";
  if (sides === 100) return "%";
  return "◈";
}

function getDieDisplayLabel(line: PreparedRollCardLine) {
  if (line.sides === 100) return "d100";
  if (line.sides) return `d${line.sides}`;
  return line.label;
}

function PreparedActionButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
}) {
  const { theme } = useArcaneTheme();

  const backgroundColor =
    variant === "accent"
      ? "rgba(217, 160, 55, 0.14)"
      : variant === "danger"
        ? "rgba(255, 92, 122, 0.1)"
        : "rgba(32, 41, 88, 0.44)";

  const borderColor =
    variant === "accent"
      ? theme.colors.accent
      : variant === "danger"
        ? theme.colors.failure
        : "rgba(145, 113, 255, 0.16)";

  const textColor =
    variant === "danger"
      ? theme.colors.failure
      : variant === "accent"
        ? theme.colors.accent
        : theme.colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 11,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HeaderBadge({ label }: { label: string }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(217, 160, 55, 0.38)",
        backgroundColor: "rgba(217, 160, 55, 0.1)",
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.accent,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.55,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PreparedDieTile({
  line,
  index,
  onAdjustQty,
  onOpenLineConfig,
}: {
  line: PreparedRollCardLine;
  index: number;
  onAdjustQty?: (index: number, delta: number) => void;
  onOpenLineConfig?: (index: number) => void;
}) {
  const { theme } = useArcaneTheme();

  const qty = Math.max(1, line.qty ?? 1);
  const modifier = line.modifier ?? 0;
  const hasModifier = modifier !== 0;
  const modifierLabel = modifier > 0 ? `+${modifier}` : `${modifier}`;

  const isNegative = line.sign === -1;
  const hasBehavior = !!line.hasBehavior;
  const canDecrease = !!onAdjustQty && qty > 1;

  const borderColor = isNegative
    ? "rgba(255, 92, 122, 0.44)"
    : hasBehavior
      ? "rgba(160, 92, 255, 0.72)"
      : "rgba(217, 160, 55, 0.44)";

  const backgroundColor = isNegative
    ? "rgba(255, 92, 122, 0.08)"
    : hasBehavior
      ? "rgba(90, 55, 170, 0.2)"
      : "rgba(13, 19, 43, 0.5)";

  const accentColor = isNegative
    ? theme.colors.failure
    : hasBehavior
      ? theme.colors.arcane
      : theme.colors.accent;

  return (
    <Pressable
      onPress={() => onOpenLineConfig?.(index)}
      disabled={!onOpenLineConfig}
      style={({ pressed }) => ({
        width: "23%",
        minWidth: 0,
        height: 68,
        borderRadius: 16,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "visible",
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -8,
          right: 2,
          minWidth: 25,
          height: 22,
          paddingHorizontal: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.accent,
          borderWidth: 1,
          borderColor: "rgba(255, 229, 160, 0.56)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <Text
          style={{
            color: theme.colors.black,
            fontSize: 10,
            fontWeight: "900",
          }}
        >
          x{qty}
        </Text>
      </View>

      {hasBehavior ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 9,
            height: 9,
            borderRadius: 999,
            backgroundColor: theme.colors.arcane,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.32)",
            zIndex: 4,
          }}
        />
      ) : null}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          width: 17,
          height: 17,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.22)",
          backgroundColor: "rgba(5, 9, 26, 0.48)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 9,
            fontWeight: "900",
            lineHeight: 11,
          }}
        >
          ⚙
        </Text>
      </View>

      <View style={{ alignItems: "center", gap: 0 }}>
        <Text
          style={{
            color: accentColor,
            fontSize: line.sides === 100 ? 17 : 16,
            fontWeight: "900",
            lineHeight: 18,
          }}
        >
          {getDieShapeLabel(line.sides)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            maxWidth: "100%",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: line.sides === 100 ? 12 : 13,
              fontWeight: "900",
              lineHeight: 15,
            }}
          >
            {getDieDisplayLabel(line)}
          </Text>

          {hasModifier ? (
            <View
              style={{
                minWidth: 23,
                height: 15,
                paddingHorizontal: 4,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor:
                  modifier > 0
                    ? "rgba(80, 220, 160, 0.46)"
                    : "rgba(255, 92, 122, 0.46)",
                backgroundColor:
                  modifier > 0
                    ? "rgba(80, 220, 160, 0.1)"
                    : "rgba(255, 92, 122, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: modifier > 0 ? theme.colors.success : theme.colors.failure,
                  fontSize: 8,
                  fontWeight: "900",
                  lineHeight: 10,
                }}
              >
                {modifierLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={{
          height: 21,
          minWidth: 58,
          borderRadius: theme.radius.pill,
          backgroundColor: "rgba(5, 9, 26, 0.42)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 7,
          gap: 5,
        }}
      >
        <Pressable
          disabled={!canDecrease}
          onPress={(event) => {
            event.stopPropagation();
            onAdjustQty?.(index, -1);
          }}
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: !canDecrease ? 0.35 : pressed ? 0.68 : 1,
            transform: [{ scale: pressed && canDecrease ? 0.9 : 1 }],
          })}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 17,
            }}
          >
            −
          </Text>
        </Pressable>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 12,
            fontWeight: "900",
            lineHeight: 15,
            minWidth: 10,
            textAlign: "center",
          }}
        >
          {qty}
        </Text>

        <Pressable
          disabled={!onAdjustQty}
          onPress={(event) => {
            event.stopPropagation();
            onAdjustQty?.(index, 1);
          }}
          hitSlop={6}
          style={({ pressed }) => ({
            opacity: !onAdjustQty ? 0.35 : pressed ? 0.68 : 1,
            transform: [{ scale: pressed && onAdjustQty ? 0.9 : 1 }],
          })}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 15,
              fontWeight: "900",
              lineHeight: 17,
            }}
          >
            +
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function PreparedMoreTile({
  hiddenCount,
  onPress,
}: {
  hiddenCount: number;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "23%",
        minWidth: 0,
        height: 68,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.3)",
        backgroundColor: pressed
          ? "rgba(32, 41, 88, 0.62)"
          : "rgba(32, 41, 88, 0.44)",
        paddingVertical: 6,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.arcane,
          fontSize: 20,
          fontWeight: "900",
          lineHeight: 22,
        }}
      >
        ⋯
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.text,
          fontSize: 11,
          fontWeight: "900",
        }}
      >
        Voir plus
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.textMuted,
          fontSize: 10,
          fontWeight: "800",
        }}
      >
        +{hiddenCount}
      </Text>
    </Pressable>
  );
}

function PreparedDiceListModal({
  visible,
  lines,
  onClose,
  onAdjustLineQty,
  onOpenLineConfig,
}: {
  visible: boolean;
  lines: PreparedRollCardLine[];
  onClose: () => void;
  onAdjustLineQty?: (index: number, delta: number) => void;
  onOpenLineConfig?: (index: number) => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "72%",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.26)",
            backgroundColor: rollTheme.cockpit.panel,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 210,
              height: 210,
              borderRadius: 999,
              backgroundColor: rollTheme.cockpit.magicGlow,
              opacity: 0.14,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Jet préparé
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontSize: 23,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                }}
              >
                Tous les dés
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {lines.length} ligne{lines.length > 1 ? "s" : ""} dans ce jet.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.22)",
                backgroundColor: pressed
                  ? "rgba(32, 41, 88, 0.72)"
                  : "rgba(32, 41, 88, 0.52)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: theme.spacing.md,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 10,
                paddingTop: 4,
              }}
            >
              {lines.map((line, index) => (
                <PreparedDieTile
                  key={`all-prepared-${line.id}`}
                  line={line}
                  index={index}
                  onAdjustQty={onAdjustLineQty}
                  onOpenLineConfig={(lineIndex) => {
                    onClose();
                    onOpenLineConfig?.(lineIndex);
                  }}
                />
              ))}
            </View>

            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: 11,
                fontWeight: "700",
                lineHeight: 16,
              }}
            >
              Les dés avec un point violet ont un comportement configuré.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PreparedLineConfigModal({
  visible,
  line,
  index,
  onClose,
  onAdjustQty,
  onAdjustModifier,
  onToggleSign,
  onConfigureBehavior,
  onRemove,
}: {
  visible: boolean;
  line: PreparedRollCardLine | null;
  index: number | null;
  onClose: () => void;
  onAdjustQty?: (index: number, delta: number) => void;
  onAdjustModifier?: (index: number, delta: number) => void;
  onToggleSign?: (index: number) => void;
  onConfigureBehavior?: (index: number) => void;
  onRemove?: (index: number) => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!line || index == null) return null;

  const qty = Math.max(1, line.qty ?? 1);
  const modifier = line.modifier ?? 0;
  const isNegative = line.sign === -1;
  const canDecreaseQty = qty > 1 && !!onAdjustQty;

  const lineTitle = `${qty}${isNegative ? "d" : "d"}${line.sides ?? ""}`;
  const displayModifier =
    modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "0";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <View
          style={{
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.26)",
            backgroundColor: rollTheme.cockpit.panel,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            overflow: "hidden",
            ...theme.shadow.card,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -76,
              top: -76,
              width: 190,
              height: 190,
              borderRadius: 999,
              backgroundColor: line.hasBehavior
                ? rollTheme.cockpit.magicGlow
                : rollTheme.cockpit.glow,
              opacity: 0.15,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Ligne de dés
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontSize: 24,
                  fontWeight: "900",
                  letterSpacing: -0.4,
                }}
              >
                {line.label}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {line.detail ?? "Somme simple"}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.22)",
                backgroundColor: pressed
                  ? "rgba(32, 41, 88, 0.72)"
                  : "rgba(32, 41, 88, 0.52)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: isNegative
                ? "rgba(255, 92, 122, 0.28)"
                : "rgba(145, 113, 255, 0.18)",
              backgroundColor: isNegative
                ? "rgba(255, 92, 122, 0.08)"
                : "rgba(13, 19, 43, 0.58)",
              padding: 12,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: line.hasBehavior
                    ? "rgba(160, 92, 255, 0.76)"
                    : "rgba(217, 160, 55, 0.58)",
                  backgroundColor: line.hasBehavior
                    ? "rgba(90, 55, 170, 0.2)"
                    : "rgba(217, 160, 55, 0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: line.hasBehavior
                      ? theme.colors.arcane
                      : theme.colors.accent,
                    fontSize: 24,
                    fontWeight: "900",
                    lineHeight: 28,
                  }}
                >
                  {getDieShapeLabel(line.sides)}
                </Text>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 13,
                    fontWeight: "900",
                    marginTop: -1,
                  }}
                >
                  {getDieDisplayLabel(line)}
                </Text>
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  {lineTitle || line.label}
                </Text>

                <Text
                  style={{
                    color: isNegative
                      ? theme.colors.failure
                      : theme.colors.success,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  {isNegative ? "Malus (−)" : "Bonus (+)"}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Modificateur : {displayModifier}
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "rgba(145, 113, 255, 0.13)",
              }}
            />

            <View style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.textSubtle,
                      fontSize: 10,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.75,
                    }}
                  >
                    Quantité
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 20,
                      fontWeight: "900",
                      marginTop: 2,
                    }}
                  >
                    {qty}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <Pressable
                    disabled={!canDecreaseQty}
                    onPress={() => onAdjustQty?.(index, -1)}
                    style={({ pressed }) => ({
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: "rgba(145, 113, 255, 0.22)",
                      backgroundColor: "rgba(32, 41, 88, 0.42)",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: !canDecreaseQty ? 0.35 : pressed ? 0.72 : 1,
                      transform: [{ scale: pressed && canDecreaseQty ? 0.94 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      −
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!onAdjustQty}
                    onPress={() => onAdjustQty?.(index, 1)}
                    style={({ pressed }) => ({
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: "rgba(145, 113, 255, 0.22)",
                      backgroundColor: "rgba(32, 41, 88, 0.42)",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: !onAdjustQty ? 0.35 : pressed ? 0.72 : 1,
                      transform: [{ scale: pressed && onAdjustQty ? 0.94 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                disabled={!onToggleSign}
                onPress={() => onToggleSign?.(index)}
                style={({ pressed }) => ({
                  minHeight: 46,
                  borderRadius: theme.radius.pill,
                  borderWidth: 1,
                  borderColor: isNegative
                    ? "rgba(255, 92, 122, 0.42)"
                    : "rgba(80, 220, 160, 0.36)",
                  backgroundColor: isNegative
                    ? "rgba(255, 92, 122, 0.09)"
                    : "rgba(80, 220, 160, 0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !onToggleSign ? 0.4 : pressed ? 0.78 : 1,
                  transform: [{ scale: pressed && onToggleSign ? 0.98 : 1 }],
                })}
              >
                <Text
                  style={{
                    color: isNegative
                      ? theme.colors.failure
                      : theme.colors.success,
                    fontSize: 14,
                    fontWeight: "900",
                  }}
                >
                  Basculer + / −
                </Text>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.textSubtle,
                      fontSize: 10,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.75,
                    }}
                  >
                    Modificateur
                  </Text>

                  <Text
                    style={{
                      color:
                        modifier > 0
                          ? theme.colors.success
                          : modifier < 0
                            ? theme.colors.failure
                            : theme.colors.textMuted,
                      fontSize: 20,
                      fontWeight: "900",
                      marginTop: 2,
                    }}
                  >
                    {displayModifier}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <Pressable
                    disabled={!onAdjustModifier}
                    onPress={() => onAdjustModifier?.(index, -1)}
                    style={({ pressed }) => ({
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: "rgba(145, 113, 255, 0.22)",
                      backgroundColor: "rgba(32, 41, 88, 0.42)",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: !onAdjustModifier ? 0.35 : pressed ? 0.72 : 1,
                      transform: [
                        { scale: pressed && onAdjustModifier ? 0.94 : 1 },
                      ],
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      −
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!onAdjustModifier}
                    onPress={() => onAdjustModifier?.(index, 1)}
                    style={({ pressed }) => ({
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: "rgba(145, 113, 255, 0.22)",
                      backgroundColor: "rgba(32, 41, 88, 0.42)",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: !onAdjustModifier ? 0.35 : pressed ? 0.72 : 1,
                      transform: [
                        { scale: pressed && onAdjustModifier ? 0.94 : 1 },
                      ],
                    })}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "rgba(145, 113, 255, 0.13)",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              <PreparedActionButton
                label="Comportement"
                onPress={() => {
                  onClose();
                  onConfigureBehavior?.(index);
                }}
                variant="accent"
              />

              <PreparedActionButton
                label="Retirer"
                onPress={() => {
                  onClose();
                  onRemove?.(index);
                }}
                variant="danger"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EmptyPreparedState() {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        minHeight: 48,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.14)",
        backgroundColor: "rgba(28, 37, 82, 0.34)",
        paddingVertical: 9,
        paddingHorizontal: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.18)",
          backgroundColor: "rgba(32, 41, 88, 0.38)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme.colors.textSubtle,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          🎲
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          Aucun jet préparé
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textMuted,
            fontSize: 11,
            fontWeight: "700",
            marginTop: 1,
          }}
        >
          Ajoute un dé depuis le cercle.
        </Text>
      </View>
    </View>
  );
}

export function PreparedRollCard({
  title = "Jet préparé",
  name,
  detail,
  lines,
  isEmpty,
  onEdit,
  onClear,
  onSave,
  onAdjustLineQty,
  onAdjustLineModifier,
  onToggleLineSign,
  onRemoveLine,
  onConfigureLineBehavior,
}: PreparedRollCardProps) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);
  const [showAllDiceModal, setShowAllDiceModal] = useState(false);
  const [selectedLineConfigIndex, setSelectedLineConfigIndex] = useState<
    number | null
  >(null);

  const preparedLines = useMemo(
    () => lines?.filter((line) => line.label.trim().length > 0) ?? [],
    [lines],
  );

  const maxVisibleTiles = 8;
  const shouldShowMoreTile = preparedLines.length > maxVisibleTiles;

  const visiblePreparedLines = shouldShowMoreTile
    ? preparedLines.slice(0, maxVisibleTiles - 1)
    : preparedLines.slice(0, maxVisibleTiles);

  const hiddenPreparedLineCount =
    preparedLines.length - visiblePreparedLines.length;

  const lineCountLabel = `${preparedLines.length} ligne${preparedLines.length > 1 ? "s" : ""
    }`;

  const hasBehavior = preparedLines.some((line) => line.hasBehavior);

  return (
    <>

      <View
        style={{
          borderRadius: rollTheme.layout.cockpitRadius,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.2)",
          backgroundColor: "rgba(13, 19, 43, 0.68)",
          overflow: "hidden",
          paddingVertical: 9,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -76,
            right: -62,
            width: 164,
            height: 164,
            borderRadius: 999,
            backgroundColor: isEmpty
              ? "rgba(145, 113, 255, 0.1)"
              : rollTheme.cockpit.glow,
            opacity: isEmpty ? 0.08 : 0.12,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -96,
            bottom: -100,
            width: 180,
            height: 180,
            borderRadius: 999,
            backgroundColor: rollTheme.cockpit.magicGlow,
            opacity: 0.055,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 27,
                height: 27,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(160, 92, 255, 0.62)",
                backgroundColor: "rgba(160, 92, 255, 0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.arcane,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                ⚑
              </Text>
            </View>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "900",
                letterSpacing: -0.15,
                textTransform: title === "Jet préparé" ? "uppercase" : "none",
                flexShrink: 1,
              }}
            >
              {title}
            </Text>

            {!isEmpty ? <HeaderBadge label={lineCountLabel} /> : null}
          </View>

          {onEdit ? (
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => ({
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.18)",
                backgroundColor: "rgba(32, 41, 88, 0.42)",
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                Modifier ✎
              </Text>
            </Pressable>
          ) : null}
        </View>

        {isEmpty ? (
          <EmptyPreparedState />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 7,
                paddingTop: 2,
              }}
            >
              {visiblePreparedLines.map((line, index) => (
                <PreparedDieTile
                  key={line.id}
                  line={line}
                  index={index}
                  onAdjustQty={onAdjustLineQty}
                  onOpenLineConfig={setSelectedLineConfigIndex}
                />
              ))}

              {shouldShowMoreTile ? (
                <PreparedMoreTile
                  hiddenCount={hiddenPreparedLineCount}
                  onPress={() => setShowAllDiceModal(true)}
                />
              ) : null}
            </View>

            {hasBehavior ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  marginTop: -1,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: theme.colors.arcane,
                  }}
                />

                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.textSubtle,
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  Point violet : comportement configuré
                </Text>
              </View>
            ) : null}

            <View
              style={{
                height: 1,
                backgroundColor: "rgba(145, 113, 255, 0.12)",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: theme.spacing.xs,
              }}
            >
              {onSave ? (
                <PreparedActionButton label="Sauver" onPress={onSave} />
              ) : null}

              {onClear ? (
                <PreparedActionButton
                  label="Vider"
                  onPress={onClear}
                  variant="danger"
                />
              ) : null}
            </View>
          </>
        )}
      </View>
      <PreparedDiceListModal
        visible={showAllDiceModal}
        lines={preparedLines}
        onClose={() => setShowAllDiceModal(false)}
        onAdjustLineQty={onAdjustLineQty}
        onOpenLineConfig={setSelectedLineConfigIndex}
      />

      <PreparedLineConfigModal
        visible={selectedLineConfigIndex != null}
        line={
          selectedLineConfigIndex != null
            ? preparedLines[selectedLineConfigIndex] ?? null
            : null
        }
        index={selectedLineConfigIndex}
        onClose={() => setSelectedLineConfigIndex(null)}
        onAdjustQty={onAdjustLineQty}
        onAdjustModifier={onAdjustLineModifier}
        onToggleSign={onToggleLineSign}
        onConfigureBehavior={onConfigureLineBehavior}
        onRemove={onRemoveLine}
      />
    </>

  );
}