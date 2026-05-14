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
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

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
        : theme.colors.border;

  const textColor =
    variant === "danger"
      ? theme.colors.failure
      : variant === "accent"
        ? theme.colors.accent
        : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor,
        borderRadius: theme.radius.pill,
        backgroundColor: pressed ? theme.colors.surfaceSoft : backgroundColor,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: rollTheme.cockpit.glow,
        shadowOpacity: variant === "accent" ? 0.22 : 0,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: variant === "accent" ? 3 : 0,
      })}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreparedLineBadge({
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
        paddingVertical: 6,
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
        style={{
          color:
            tone === "accent" ? theme.colors.accent : theme.colors.textMuted,
          fontSize: theme.typography.small,
          fontWeight: "900",
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

  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: isEmpty
          ? theme.colors.borderSoft
          : rollTheme.cockpit.border,
        backgroundColor: rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -48,
          right: -48,
          width: 130,
          height: 130,
          borderRadius: 999,
          backgroundColor: isEmpty
            ? theme.colors.surfaceSoft
            : rollTheme.cockpit.glow,
          opacity: isEmpty ? 0.16 : 0.22,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            ✦ {title}
          </Text>

          {isEmpty ? (
            <>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 21,
                  fontWeight: "900",
                  letterSpacing: -0.2,
                }}
              >
                Aucun jet préparé
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                Choisis un dé libre ou une action pour préparer ton prochain
                jet.
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 23,
                  fontWeight: "900",
                  letterSpacing: -0.3,
                }}
              >
                {name ?? "Jet"}
              </Text>

              {detailParts.length > 0 ? (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: theme.spacing.sm,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  {detailParts.map((part, index) => (
                    <PreparedLineBadge
                      key={`prepared-detail-${index}-${part}`}
                      label={part}
                      tone={index === 0 ? "accent" : "default"}
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>

        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: isEmpty
              ? theme.colors.borderSoft
              : theme.colors.accent,
            backgroundColor: isEmpty
              ? theme.colors.surfaceAlt
              : theme.colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: isEmpty ? theme.colors.textSubtle : theme.colors.accent,
              fontSize: 22,
              fontWeight: "900",
            }}
          >
            {isEmpty ? "?" : "🎲"}
          </Text>
        </View>
      </View>

      {!isEmpty ? (
        <>
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
              gap: theme.spacing.sm,
            }}
          >
            {onEdit ? (
              <PreparedActionButton
                label="Modifier"
                onPress={onEdit}
                variant="accent"
              />
            ) : null}

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
        </>
      ) : null}
    </View>
  );
}
