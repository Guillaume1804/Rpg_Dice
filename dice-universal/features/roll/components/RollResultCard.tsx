import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { renderRollResult } from "../renderers/rollResultRenderer";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type Props = {
  result: any | null;
  title?: string;
};

type Tone = "neutral" | "success" | "failure" | "warning" | "critical";

type ThemeColors = ReturnType<typeof useArcaneTheme>["theme"]["colors"];

type BadgeTone = Tone;

type ResultBadge = {
  label: string;
  tone?: BadgeTone;
};

function getToneIcon(tone?: Tone) {
  if (tone === "critical") return "✦";
  if (tone === "success") return "✓";
  if (tone === "failure") return "✖";
  if (tone === "warning") return "⚠";
  return "🎲";
}

function getToneLabel(tone?: Tone) {
  if (tone === "critical") return "Critique";
  if (tone === "success") return "Réussite";
  if (tone === "failure") return "Échec";
  if (tone === "warning") return "Attention";
  return "Résultat";
}

function getToneColors(tone: Tone | undefined, colors: ThemeColors) {
  if (tone === "critical") {
    return {
      border: colors.accent,
      background: colors.accentSoft,
      text: colors.accent,
      soft: "rgba(217, 160, 55, 0.12)",
    };
  }

  if (tone === "success") {
    return {
      border: colors.success,
      background: colors.successSoft,
      text: colors.success,
      soft: colors.successSoft,
    };
  }

  if (tone === "failure") {
    return {
      border: colors.failure,
      background: colors.failureSoft,
      text: colors.failure,
      soft: colors.failureSoft,
    };
  }

  if (tone === "warning") {
    return {
      border: colors.warning,
      background: colors.warningSoft,
      text: colors.warning,
      soft: colors.warningSoft,
    };
  }

  return {
    border: colors.border,
    background: colors.surfaceAlt,
    text: colors.text,
    soft: "rgba(32, 41, 88, 0.52)",
  };
}

function getBadgeColors(tone: BadgeTone | undefined, colors: ThemeColors) {
  if (tone === "critical") {
    return {
      border: colors.accent,
      background: colors.accentSoft,
      text: colors.accent,
    };
  }

  if (tone === "success") {
    return {
      border: colors.success,
      background: colors.successSoft,
      text: colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: colors.failure,
      background: colors.failureSoft,
      text: colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: colors.warning,
      background: colors.warningSoft,
      text: colors.warning,
    };
  }

  return {
    border: "rgba(145, 113, 255, 0.2)",
    background: "rgba(32, 41, 88, 0.48)",
    text: colors.textMuted,
  };
}

function ResultBadgeView({ badge }: { badge: ResultBadge }) {
  const { theme } = useArcaneTheme();
  const colors = getBadgeColors(badge.tone, theme.colors);

  return (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        {badge.label}
      </Text>
    </View>
  );
}

function getAutoBadges(
  rendered: NonNullable<ReturnType<typeof renderRollResult>>,
) {
  const badges: ResultBadge[] = [];

  badges.push({
    label: getToneLabel(rendered.tone),
    tone: rendered.tone ?? "neutral",
  });

  if (rendered.title) {
    badges.push({
      label: rendered.title,
    });
  }

  const joined = [...rendered.lines, ...(rendered.details ?? [])]
    .join(" ")
    .toLowerCase();

  if (joined.includes("complication") || joined.includes("faces spéciales")) {
    badges.push({
      label: "Complication",
      tone: "warning",
    });
  }

  if (joined.includes("réussite critique")) {
    badges.push({
      label: "Critique",
      tone: "critical",
    });
  }

  if (joined.includes("échec critique")) {
    badges.push({
      label: "Échec critique",
      tone: "failure",
    });
  }

  if (joined.includes("explosion")) {
    badges.push({
      label: "Explosion",
      tone: "critical",
    });
  }

  if (joined.includes("relance")) {
    badges.push({
      label: "Relance",
      tone: "neutral",
    });
  }

  if (joined.includes("degré")) {
    badges.push({
      label: "Degrés",
      tone: "success",
    });
  }

  const unique = new Map<string, ResultBadge>();

  for (const badge of badges) {
    if (!unique.has(badge.label)) {
      unique.set(badge.label, badge);
    }
  }

  return [...unique.values()].slice(0, 5);
}

function ResultTextLine({ line, index }: { line: string; index: number }) {
  const { theme } = useArcaneTheme();

  const isSectionTitle = line.endsWith(":");
  const isImportant =
    line.toLowerCase().includes("final") ||
    line.toLowerCase().includes("succès") ||
    line.toLowerCase().includes("degré") ||
    line.toLowerCase().includes("marge") ||
    line.toLowerCase().includes("complication") ||
    line.toLowerCase().includes("critique");

  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor:
          isSectionTitle || isImportant
            ? "rgba(32, 41, 88, 0.48)"
            : "rgba(13, 19, 43, 0.32)",
        borderWidth: 1,
        borderColor:
          isSectionTitle || isImportant
            ? "rgba(145, 113, 255, 0.16)"
            : "rgba(145, 113, 255, 0.08)",
      }}
    >
      <Text
        style={{
          color: isSectionTitle
            ? theme.colors.text
            : isImportant
              ? theme.colors.text
              : theme.colors.textMuted,
          fontSize: isSectionTitle ? 13 : 12,
          fontWeight: isSectionTitle || isImportant ? "900" : "700",
          lineHeight: 17,
        }}
      >
        {line}
      </Text>
    </View>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { theme } = useArcaneTheme();

  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.75,
        }}
      >
        {title}
      </Text>

      {children}
    </View>
  );
}

export function RollResultCard({ result, title }: Props) {
  const { theme } = useArcaneTheme();
  const rendered = renderRollResult(result);

  if (!rendered) return null;

  const toneColors = getToneColors(rendered.tone, theme.colors);
  const badges = getAutoBadges(rendered);

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: toneColors.border,
        backgroundColor: "rgba(13, 19, 43, 0.68)",
        padding: 11,
        gap: 10,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -54,
          top: -62,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: toneColors.text,
          opacity: 0.08,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: toneColors.border,
            backgroundColor: toneColors.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: toneColors.text,
              fontSize: 21,
              fontWeight: "900",
              lineHeight: 24,
            }}
          >
            {getToneIcon(rendered.tone)}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.textSubtle,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.75,
            }}
          >
            {title ?? rendered.title}
          </Text>

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              color: toneColors.text,
              fontSize: 18,
              fontWeight: "900",
              letterSpacing: -0.25,
              lineHeight: 22,
            }}
          >
            {rendered.summary}
          </Text>
        </View>
      </View>

      {badges.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {badges.map((badge) => (
            <ResultBadgeView
              key={`roll-result-badge-${badge.label}`}
              badge={badge}
            />
          ))}
        </View>
      ) : null}

      {rendered.lines.length > 0 ? (
        <ResultSection title="Lecture rapide">
          <View style={{ gap: 5 }}>
            {rendered.lines.map((line, index) => (
              <ResultTextLine
                key={`roll-result-line-${index}`}
                line={line}
                index={index}
              />
            ))}
          </View>
        </ResultSection>
      ) : null}

      {rendered.details && rendered.details.length > 0 ? (
        <ResultSection title="Détails de règle">
          <View style={{ gap: 5 }}>
            {rendered.details.map((line, index) => (
              <ResultTextLine
                key={`roll-result-detail-${index}`}
                line={line}
                index={index}
              />
            ))}
          </View>
        </ResultSection>
      ) : null}
    </View>
  );
}
