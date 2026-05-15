// dice-universal\features\roll\components\FreeDicePad.tsx

import { useMemo } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
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

type DiceLayout = {
  angle: number;
  size: number;
  height: number;
  featured: boolean;
  zIndex: number;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Arche pensée comme un futur barillet rotatif.
 * 90° = dé sélectionné au sommet.
 *
 * Important :
 * Les angles sont volontairement espacés, mais le rayon horizontal est contrôlé
 * pour éviter que d4/d8 ou d6/d100 soient clampés contre les bords.
 */
function getDiceLayout(sides: number, featuredSides: number): DiceLayout {
  if (sides === featuredSides) {
    return {
      angle: 90,
      size: 66,
      height: 76,
      featured: true,
      zIndex: 50,
    };
  }

  switch (sides) {
    case 12:
      return {
        angle: 112,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 36,
      };

    case 10:
      return {
        angle: 68,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 36,
      };

    case 100:
      return {
        angle: 133,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 30,
      };

    case 8:
      return {
        angle: 47,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 30,
      };

    case 6:
      return {
        angle: 154,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 24,
      };

    case 4:
      return {
        angle: 26,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 24,
      };

    default:
      return {
        angle: 270,
        size: 45,
        height: 53,
        featured: false,
        zIndex: 10,
      };
  }
}

export function FreeDicePad({
  title: _title = "Cercle de dés",
  subtitle: _subtitle = "Appui long : effet",
  dice,
  countsBySides = {},
  onPressDie,
  onLongPressDie,
}: FreeDicePadProps) {
  const { width } = useWindowDimensions();
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const arenaWidth = Math.max(300, Math.min(width - 48, 620));
  const arenaHeight = 284;

  const wheelCenterX = arenaWidth / 2;

  /**
   * Centre bas = impression de grand cercle dont on ne voit que le haut.
   */
  const wheelCenterY = 264;

  /**
   * Rayon horizontal réduit par rapport à la version précédente.
   * C'est ce qui corrige l'effet "d4 sous d8" et "d6 sous d100".
   */
  const radiusX = Math.min(arenaWidth * 0.47, 170);

  /**
   * Rayon vertical plus grand : les dés descendent naturellement sur l’arche
   * sans avoir besoin d'être poussés contre les bords.
   */
  const radiusY = 174;

  /**
   * Les arcs décoratifs sont volontairement un peu plus grands que le rayon
   * des dés pour donner l'impression que les dés sont posés entre deux rails.
   */
  const outerArcRadiusX = radiusX + 46;
  const outerArcRadiusY = radiusY + 24;
  const innerArcRadiusX = radiusX + 12;
  const innerArcRadiusY = radiusY - 18;
  const lowerArcRadiusX = radiusX - 22;
  const lowerArcRadiusY = radiusY - 58;

  const featuredSides = useMemo(() => {
    if (dice.includes(20)) return 20;
    return dice[0] ?? 20;
  }, [dice]);

  const orderedDice = useMemo(() => {
    const preferredOrder = [20, 12, 10, 100, 8, 6, 4];

    return [...dice].sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a - b;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [dice]);

  function renderCountBadge(sides: number, featured = false) {
    const count = countsBySides[sides] ?? 0;

    if (count <= 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: featured ? -8 : -7,
          right: featured ? -8 : -7,
          minWidth: featured ? 28 : 22,
          height: featured ? 28 : 22,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.accent,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 7,
          borderWidth: 1,
          borderColor: rollTheme.diceZone.ringGlow,
          shadowColor: rollTheme.diceZone.ringGlow,
          shadowOpacity: 0.38,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: rollTheme.launchButton.text,
            fontSize: featured ? 13 : 11,
            fontWeight: "900",
          }}
        >
          x{count}
        </Text>
      </View>
    );
  }

  function getDiePosition(layout: DiceLayout) {
    const rad = degToRad(layout.angle);

    const centerX = wheelCenterX + radiusX * Math.cos(rad);
    const centerY = wheelCenterY - radiusY * Math.sin(rad);

    const sideMargin = 8;

    const left = clamp(
      centerX - layout.size / 2,
      sideMargin,
      arenaWidth - layout.size - sideMargin,
    );

    const top = clamp(
      centerY - layout.height / 2,
      8,
      arenaHeight - layout.height - 8,
    );

    return { left, top };
  }

  function renderDieButton(sides: number) {
    const count = countsBySides[sides] ?? 0;
    const isActive = count > 0;
    const layout = getDiceLayout(sides, featuredSides);
    const isFeatured = layout.featured;
    const position = getDiePosition(layout);

    return (
      <Pressable
        key={sides}
        onPress={() => onPressDie(sides)}
        onLongPress={() => onLongPressDie?.(sides)}
        delayLongPress={300}
        style={({ pressed }) => ({
          position: "absolute",
          left: position.left,
          top: position.top,
          width: layout.size,
          height: layout.height,
          zIndex: layout.zIndex,
          borderRadius: isFeatured ? 21 : 17,
          borderWidth: 1,
          borderColor: isFeatured
            ? theme.colors.accent
            : isActive
              ? rollTheme.diceZone.ringGlow
              : "rgba(145, 113, 255, 0.24)",
          backgroundColor: isFeatured
            ? "rgba(217, 160, 55, 0.23)"
            : isActive
              ? rollTheme.diceZone.dieSelected
              : "rgba(30, 38, 89, 0.68)",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.84 : 1,
          transform: [{ scale: pressed ? 0.965 : 1 }],
          shadowColor: isFeatured
            ? theme.colors.accent
            : isActive
              ? rollTheme.diceZone.ringGlow
              : rollTheme.cockpit.magicGlow,
          shadowOpacity: isFeatured ? 0.36 : isActive ? 0.22 : 0.1,
          shadowRadius: isFeatured ? 16 : 8,
          shadowOffset: { width: 0, height: isFeatured ? 9 : 4 },
          elevation: isFeatured ? 10 : isActive ? 4 : 2,
        })}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: isFeatured ? 60 : 34,
            height: isFeatured ? 60 : 34,
            borderRadius: 999,
            backgroundColor: isFeatured
              ? theme.colors.accent
              : rollTheme.cockpit.magicGlow,
            opacity: isFeatured ? 0.18 : 0.1,
          }}
        />

        <Text
          style={{
            color: isFeatured
              ? theme.colors.accent
              : isActive
                ? rollTheme.diceZone.ringGlow
                : rollTheme.diceZone.dieAccent,
            fontSize: isFeatured ? 27 : 17,
            lineHeight: isFeatured ? 31 : 20,
            fontWeight: "900",
          }}
        >
          {getDieShapeLabel(sides)}
        </Text>

        <Text
          style={{
            marginTop: isFeatured ? 1 : 0,
            color: rollTheme.diceZone.dieText,
            fontSize: isFeatured ? 18 : 12,
            fontWeight: "900",
            letterSpacing: isFeatured ? 0.2 : 0,
          }}
        >
          {getDieDisplayLabel(sides)}
        </Text>

        {renderCountBadge(sides, isFeatured)}
      </Pressable>
    );
  }

  return (
    <View
      style={{
        height: arenaHeight,
        alignSelf: "center",
        width: "100%",
        maxWidth: arenaWidth,
        backgroundColor: "transparent",
        overflow: "visible",
        marginTop: -18,
        marginBottom: -18,
      }}
    >
      {/* halos de fond, sans effet de carte */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -84,
          top: -4,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.05,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -84,
          top: 4,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.glow,
          opacity: 0.045,
        }}
      />

      {/* arc extérieur : rail haut qui englobe les dés */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - outerArcRadiusY,
          width: outerArcRadiusX * 2,
          height: outerArcRadiusY * 2,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.accent,
          opacity: 0.18,
        }}
      />

      {/* arc intérieur : second rail visible entre dés et modificateur */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - innerArcRadiusY,
          width: innerArcRadiusX * 2,
          height: innerArcRadiusY * 2,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: rollTheme.cockpit.magicGlow,
          opacity: 0.16,
        }}
      />

      {/* arc bas : profondeur du barillet */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: wheelCenterY - lowerArcRadiusY,
          width: lowerArcRadiusX * 2,
          height: lowerArcRadiusY * 2,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.18)",
          opacity: 0.1,
        }}
      />

      {/* petits points latéraux sur le rail extérieur */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: arenaWidth * 0.21,
          top: 124,
          width: 4,
          height: 4,
          borderRadius: 999,
          backgroundColor: theme.colors.accent,
          opacity: 0.68,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: arenaWidth * 0.21,
          top: 124,
          width: 4,
          height: 4,
          borderRadius: 999,
          backgroundColor: theme.colors.accent,
          opacity: 0.68,
        }}
      />

      {/* halo central */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: 102,
          width: 148,
          height: 148,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.07,
        }}
      />

      {/* zone modificateur intégrée dans l'arche */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          alignSelf: "center",
          top: 138,
          width: 166,
          alignItems: "center",
          gap: 8,
          zIndex: 4,
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.9,
          }}
        >
          Modificateur
        </Text>

        <View
          style={{
            width: 140,
            height: 38,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.22)",
            backgroundColor: "rgba(10, 14, 35, 0.78)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            –
          </Text>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            + 5
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 20,
              fontWeight: "900",
            }}
          >
            +
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            Avantage
          </Text>

          <View
            style={{
              width: 46,
              height: 26,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(145, 113, 255, 0.22)",
              backgroundColor: "rgba(8, 10, 30, 0.88)",
              padding: 3,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                backgroundColor: theme.colors.text,
                alignSelf: "flex-end",
              }}
            />
          </View>
        </View>
      </View>

      {orderedDice
        .filter((sides) => sides !== featuredSides)
        .map(renderDieButton)}

      {orderedDice
        .filter((sides) => sides === featuredSides)
        .map(renderDieButton)}
    </View>
  );
}
