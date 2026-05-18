// dice-universal/features/roll/components/PreparedRollCard.tsx

import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type PreparedRollCardProps = {
  title?: string;
  name: string | null;
  detail: string | null;
  isEmpty: boolean;
  onEdit?: () => void;
  onClear?: () => void;
  onSave?: () => void;
};

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
        : "rgba(32, 41, 88, 0.52)";

  const borderColor =
    variant === "accent"
      ? theme.colors.accent
      : variant === "danger"
        ? theme.colors.failure
        : "rgba(145, 113, 255, 0.18)";

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

function PreparedDiceIcon({ empty }: { empty: boolean }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: empty
          ? "rgba(145, 113, 255, 0.18)"
          : "rgba(217, 160, 55, 0.78)",
        backgroundColor: empty
          ? "rgba(32, 41, 88, 0.38)"
          : "rgba(217, 160, 55, 0.14)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: empty ? theme.colors.textSubtle : theme.colors.accent,
          fontSize: empty ? 18 : 20,
          fontWeight: "900",
        }}
      >
        {empty ? "?" : "✦"}
      </Text>
    </View>
  );
}

function PreparedBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "accent";
}) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        alignSelf: "center",
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor:
          tone === "accent"
            ? "rgba(217, 160, 55, 0.68)"
            : "rgba(145, 113, 255, 0.18)",
        backgroundColor:
          tone === "accent"
            ? "rgba(217, 160, 55, 0.12)"
            : "rgba(32, 41, 88, 0.46)",
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color:
            tone === "accent" ? theme.colors.accent : theme.colors.textMuted,
          fontSize: 10,
          fontWeight: "900",
          textTransform: tone === "accent" ? "uppercase" : "none",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PreparedRollCard({
  title = "Jet préparé",
  name,
  detail,
  isEmpty,
  onEdit,
  onClear,
  onSave,
}: PreparedRollCardProps) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const detailParts = useMemo(
    () =>
      detail
        ?.split("•")
        .map((part) => part.trim())
        .filter(Boolean) ?? [],
    [detail],
  );

  const primaryDetail = detailParts[0] ?? null;
  const secondaryDetail = detailParts[1] ?? null;

  const displayTitle = primaryDetail ?? name ?? "Aucun jet préparé";
  const displaySubtitle = isEmpty
    ? "Choisis un dé libre ou une action."
    : (name ?? secondaryDetail ?? "Jet principal");

  return (
    <View
      style={{
        borderRadius: rollTheme.layout.cockpitRadius,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.22)",
        backgroundColor: "rgba(13, 19, 43, 0.76)",
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
          top: -72,
          right: -58,
          width: 164,
          height: 164,
          borderRadius: 999,
          backgroundColor: isEmpty
            ? "rgba(145, 113, 255, 0.12)"
            : rollTheme.cockpit.glow,
          opacity: isEmpty ? 0.1 : 0.14,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -94,
          bottom: -96,
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.07,
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
          }}
        >
          <View
            style={{
              width: 27,
              height: 27,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(160, 92, 255, 0.68)",
              backgroundColor: "rgba(160, 92, 255, 0.13)",
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
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
              letterSpacing: -0.15,
              textTransform: "uppercase",
            }}
          >
            {title}
          </Text>
        </View>

        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => ({
              paddingVertical: 5,
              paddingHorizontal: 9,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(145, 113, 255, 0.18)",
              backgroundColor: "rgba(32, 41, 88, 0.46)",
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

      <View
        style={{
          minHeight: isEmpty ? 58 : secondaryDetail ? 86 : 58,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.16)",
          backgroundColor: "rgba(28, 37, 82, 0.52)",
          paddingVertical: 8,
          paddingHorizontal: 10,
          gap: 7,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <PreparedDiceIcon empty={isEmpty} />

          <View style={{ flex: 1, gap: 2 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: theme.colors.text,
                fontSize: isEmpty ? 17 : 18,
                fontWeight: "900",
                letterSpacing: isEmpty ? -0.15 : -0.25,
                lineHeight: isEmpty ? 21 : 22,
              }}
            >
              {displayTitle}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: theme.colors.textMuted,
                fontSize: 11,
                fontWeight: "700",
                lineHeight: 14,
              }}
            >
              {displaySubtitle}
            </Text>
          </View>

          {!isEmpty ? <PreparedBadge label="Principal" tone="accent" /> : null}
        </View>

        {!isEmpty && secondaryDetail ? (
          <>
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(145, 113, 255, 0.14)",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(145, 113, 255, 0.18)",
                  backgroundColor: "rgba(32, 41, 88, 0.38)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.arcane,
                    fontSize: 17,
                    fontWeight: "900",
                  }}
                >
                  +
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: "800",
                    lineHeight: 17,
                  }}
                >
                  {secondaryDetail}
                </Text>
              </View>

              <PreparedBadge label="Effet" />
            </View>
          </>
        ) : null}
      </View>

      {!isEmpty ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
          }}
        >
          <Pressable
            onPress={onEdit}
            disabled={!onEdit}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              opacity: pressed ? 0.78 : onEdit ? 1 : 0.5,
            })}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: theme.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(160, 92, 255, 0.68)",
                backgroundColor: "rgba(160, 92, 255, 0.13)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.arcane,
                  fontSize: 18,
                  fontWeight: "900",
                  lineHeight: 21,
                }}
              >
                +
              </Text>
            </View>

            <Text
              style={{
                color: theme.colors.arcane,
                fontSize: 14,
                fontWeight: "900",
              }}
            >
              Ajouter
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
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
        </View>
      ) : null}
    </View>
  );
}
