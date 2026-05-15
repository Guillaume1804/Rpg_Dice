// dice-universal\features\roll\components\PreparedRollCard.tsx

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
      ? theme.colors.accentSoft
      : variant === "danger"
        ? theme.colors.failureSoft
        : theme.colors.surfaceAlt;

  const borderColor =
    variant === "accent"
      ? theme.colors.accent
      : variant === "danger"
        ? theme.colors.failure
        : theme.colors.borderSoft;

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
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor: pressed ? theme.colors.surfaceSoft : backgroundColor,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreparedMiniBadge({
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
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor:
          tone === "accent" ? theme.colors.accent : theme.colors.borderSoft,
        borderRadius: theme.radius.pill,
        backgroundColor:
          tone === "accent" ? theme.colors.accentSoft : theme.colors.surfaceAlt,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color:
            tone === "accent" ? theme.colors.accent : theme.colors.textMuted,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PreparedIcon({ empty }: { empty: boolean }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        width: 46,
        height: 46,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: empty ? theme.colors.borderSoft : theme.colors.accent,
        backgroundColor: empty
          ? theme.colors.surfaceAlt
          : theme.colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: empty ? theme.colors.textSubtle : theme.colors.accent,
          fontSize: 22,
          fontWeight: "900",
        }}
      >
        {empty ? "?" : "✦"}
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
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const detailParts = useMemo(
    () =>
      detail
        ?.split("•")
        .map((part) => part.trim())
        .filter(Boolean) ?? [],
    [detail],
  );

  const mainDetail = detailParts[0] ?? null;
  const secondaryDetails = detailParts.slice(1, 3);

  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.sm,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: isEmpty
          ? theme.colors.borderSoft
          : rollTheme.cockpit.border,
        backgroundColor: rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -60,
          right: -54,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: isEmpty
            ? theme.colors.surfaceSoft
            : rollTheme.cockpit.glow,
          opacity: isEmpty ? 0.12 : 0.16,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: theme.colors.arcane,
              backgroundColor: theme.colors.arcaneSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.arcane,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              ⚑
            </Text>
          </View>

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 19,
              fontWeight: "900",
              letterSpacing: -0.2,
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
              paddingVertical: 7,
              paddingHorizontal: 11,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: theme.colors.borderSoft,
              backgroundColor: pressed
                ? theme.colors.surfaceSoft
                : theme.colors.surfaceAlt,
              opacity: pressed ? 0.86 : 1,
            })}
          >
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: 13,
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
          ...styles.cardSoft,
          gap: theme.spacing.sm,
          backgroundColor: rollTheme.cockpit.panelAlt,
          borderColor: rollTheme.cockpit.borderSoft,
          paddingVertical: theme.spacing.md,
        }}
      >
        {isEmpty ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <PreparedIcon empty />

            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 20,
                  fontWeight: "900",
                  letterSpacing: -0.2,
                }}
              >
                Aucun jet préparé
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  lineHeight: 19,
                  fontWeight: "600",
                }}
              >
                Choisis un dé libre ou une action.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
              }}
            >
              <PreparedIcon empty={false} />

              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.text,
                    fontSize: 24,
                    fontWeight: "900",
                    letterSpacing: -0.4,
                  }}
                >
                  {mainDetail ?? name ?? "Jet"}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {name ?? "Jet principal"}
                </Text>
              </View>

              <PreparedMiniBadge label="Principal" tone="accent" />
            </View>

            {secondaryDetails.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm,
                  paddingLeft: 58,
                }}
              >
                {secondaryDetails.map((part, index) => (
                  <PreparedMiniBadge
                    key={`prepared-secondary-${index}-${part}`}
                    label={part}
                  />
                ))}
              </View>
            ) : null}

            {onEdit ? (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: rollTheme.cockpit.borderSoft,
                    opacity: 0.8,
                    marginTop: 2,
                  }}
                />

                <Pressable
                  onPress={onEdit}
                  style={({ pressed }) => ({
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                    paddingVertical: 8,
                    paddingHorizontal: 2,
                    opacity: pressed ? 0.78 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: theme.colors.arcane,
                      backgroundColor: theme.colors.arcaneSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.arcane,
                        fontSize: 20,
                        fontWeight: "900",
                      }}
                    >
                      +
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: theme.colors.arcane,
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    Ajouter un élément
                  </Text>
                </Pressable>
              </>
            ) : null}
          </>
        )}
      </View>

      {!isEmpty ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {onSave ? (
            <PreparedActionButton label="Sauvegarder" onPress={onSave} />
          ) : null}

          {onClear ? (
            <PreparedActionButton
              label="Vider"
              onPress={onClear}
              variant="danger"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
