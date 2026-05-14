// dice-universal/features/roll/components/FreeDicePad.tsx

import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type FreeDicePadProps = {
  title?: string;
  subtitle?: string;
  dice: number[];
  countsBySides?: Record<number, number>;
  onPressDie: (sides: number) => void;
  onLongPressDie?: (sides: number) => void;
};

function getDieShapeLabel(sides: number) {
  if (sides === 4) return "△";
  if (sides === 6) return "□";
  if (sides === 8) return "◇";
  if (sides === 10) return "⬟";
  if (sides === 12) return "⬢";
  if (sides === 20) return "✦";
  if (sides === 100) return "%";
  return "◈";
}

function getDieDisplayLabel(sides: number) {
  if (sides === 100) return "d100";
  return `d${sides}`;
}

export function FreeDicePad({
  title = "Cercle de dés",
  subtitle = "Appuie pour ajouter un dé. Appui long pour choisir un comportement.",
  dice,
  countsBySides = {},
  onPressDie,
  onLongPressDie,
}: FreeDicePadProps) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const featuredSides = useMemo(() => {
    if (dice.includes(20)) return 20;
    return dice[0] ?? 20;
  }, [dice]);

  const secondaryDice = useMemo(
    () => dice.filter((sides) => sides !== featuredSides),
    [dice, featuredSides],
  );

  function renderCountBadge(sides: number) {
    const count = countsBySides[sides] ?? 0;

    if (count <= 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          minWidth: 24,
          height: 24,
          borderRadius: theme.radius.pill,
          backgroundColor: rollTheme.diceZone.ringGlow,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 6,
          borderWidth: 1,
          borderColor: theme.colors.accent,
        }}
      >
        <Text
          style={{
            color: rollTheme.launchButton.text,
            fontSize: 12,
            fontWeight: "900",
          }}
        >
          x{count}
        </Text>
      </View>
    );
  }

  function renderDieButton(sides: number) {
    const count = countsBySides[sides] ?? 0;
    const isActive = count > 0;

    return (
      <Pressable
        key={sides}
        onPress={() => onPressDie(sides)}
        onLongPress={() => onLongPressDie?.(sides)}
        delayLongPress={300}
        style={({ pressed }) => ({
          width: 74,
          minHeight: 82,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: isActive
            ? rollTheme.diceZone.ringGlow
            : rollTheme.diceZone.ringBorder,
          backgroundColor: isActive
            ? rollTheme.diceZone.dieSelected
            : rollTheme.diceZone.dieSurface,
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.xs,
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Text
          style={{
            color: isActive
              ? rollTheme.diceZone.ringGlow
              : rollTheme.diceZone.dieAccent,
            fontSize: 25,
            fontWeight: "900",
            lineHeight: 28,
          }}
        >
          {getDieShapeLabel(sides)}
        </Text>

        <Text
          style={{
            color: rollTheme.diceZone.dieText,
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          {getDieDisplayLabel(sides)}
        </Text>

        {renderCountBadge(sides)}
      </Pressable>
    );
  }

  const featuredCount = countsBySides[featuredSides] ?? 0;
  const featuredIsActive = featuredCount > 0;

  return (
    <View
      style={[
        styles.card,
        {
          gap: theme.spacing.md,
          borderRadius: rollTheme.layout.cockpitRadius,
          borderColor: rollTheme.cockpit.border,
          backgroundColor: rollTheme.cockpit.panel,
          overflow: "hidden",
        },
      ]}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Text style={[styles.subtle, { lineHeight: 18 }]}>{subtitle}</Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: rollTheme.diceZone.ringBorder,
          borderRadius: theme.radius.xl,
          backgroundColor: rollTheme.diceZone.modifierBackground,
          padding: theme.spacing.md,
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: theme.spacing.sm,
          }}
        >
          <Pressable
            onPress={() => onPressDie(featuredSides)}
            onLongPress={() => onLongPressDie?.(featuredSides)}
            delayLongPress={300}
            style={({ pressed }) => ({
              width: 132,
              minHeight: 132,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: featuredIsActive
                ? rollTheme.diceZone.ringGlow
                : rollTheme.diceZone.ringBorder,
              backgroundColor: featuredIsActive
                ? rollTheme.diceZone.dieSelected
                : rollTheme.diceZone.dieSurface,
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.xs,
              opacity: pressed ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              ...theme.shadow.button,
            })}
          >
            <Text
              style={{
                color: featuredIsActive
                  ? rollTheme.diceZone.ringGlow
                  : rollTheme.diceZone.dieAccent,
                fontSize: 46,
                fontWeight: "900",
                lineHeight: 50,
              }}
            >
              {getDieShapeLabel(featuredSides)}
            </Text>

            <Text
              style={{
                color: rollTheme.diceZone.dieText,
                fontSize: 24,
                fontWeight: "900",
              }}
            >
              {getDieDisplayLabel(featuredSides)}
            </Text>

            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.small,
                fontWeight: "800",
              }}
            >
              Dé central
            </Text>

            {renderCountBadge(featuredSides)}
          </Pressable>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: rollTheme.cockpit.borderSoft,
            opacity: 0.9,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: theme.spacing.sm,
          }}
        >
          {secondaryDice.map(renderDieButton)}
        </View>
      </View>

      <View
        style={{
          alignSelf: "flex-start",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: theme.colors.borderSoft,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surfaceAlt,
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.small,
            fontWeight: "800",
          }}
        >
          Le jet préparé se met à jour automatiquement.
        </Text>
      </View>
    </View>
  );
}
