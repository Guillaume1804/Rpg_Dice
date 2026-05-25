// dice-universal/features/roll/components/ResultPanel.tsx

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import { RollResultCard } from "./RollResultCard";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

import { renderRollResult } from "../renderers/rollResultRenderer";

type ResultPanelProps = {
  result: GroupRollResult | null;
};

type ResultTone = "neutral" | "success" | "failure" | "warning" | "critical";

type ResultBadge = {
  label: string;
  tone?: ResultTone;
};

type ResultSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: ResultTone;
  badges: ResultBadge[];
  lines: string[];
};

type ResultHeadline = {
  title: string;
  subtitle: string;
  eyebrow: string;
  icon: string;
  tone: ResultTone;
};

function formatValues(values: number[]) {
  if (!values.length) return "—";
  return values.join(" + ");
}

function getEntryLabel(entry: GroupRollResult["entries"][number]) {
  const sign = entry.sign === -1 ? "- " : "+ ";
  const modifier = entry.modifier
    ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`
    : "";

  return `${sign}${entry.qty}d${entry.sides}${modifier}`;
}

function getPrimaryEvalResult(result: GroupRollResult) {
  return (
    result.group_eval_result ??
    result.entries.find((entry) => entry.eval_result)?.eval_result ??
    null
  );
}

function toHeadlineTone(
  tone: "neutral" | "success" | "failure" | "warning" | "critical" | undefined,
): ResultTone {
  if (tone === "critical") return "critical";
  if (tone === "success") return "success";
  if (tone === "failure") return "failure";
  if (tone === "warning") return "warning";
  return "neutral";
}

function getHeadlineIcon(tone: ResultTone) {
  if (tone === "critical") return "✦";
  if (tone === "success") return "✓";
  if (tone === "failure") return "✖";
  if (tone === "warning") return "⚠";
  return "🎲";
}

function getToneBadge(tone: ResultTone): ResultBadge | null {
  if (tone === "critical") return { label: "Critique", tone: "critical" };
  if (tone === "success") return { label: "Réussite", tone: "success" };
  if (tone === "failure") return { label: "Échec", tone: "failure" };
  if (tone === "warning") return { label: "Complication", tone: "warning" };
  return null;
}

function getEntryTone(entry: GroupRollResult["entries"][number]): ResultTone {
  const rendered = renderRollResult(entry.eval_result);
  return toHeadlineTone(rendered?.tone);
}

function getEntryIcon(entry: GroupRollResult["entries"][number]) {
  const tone = getEntryTone(entry);

  if (tone !== "neutral") {
    return getHeadlineIcon(tone);
  }

  if (entry.sign === -1) return "−";
  return "🎲";
}

function buildEntrySlide(
  entry: GroupRollResult["entries"][number],
  index: number,
): ResultSlide {
  const rendered = renderRollResult(entry.eval_result);
  const tone = toHeadlineTone(rendered?.tone);
  const toneBadge = getToneBadge(tone);

  const badges: ResultBadge[] = [
    {
      label: entry.sign === -1 ? "Malus" : "Bonus",
      tone: entry.sign === -1 ? "failure" : "success",
    },
    { label: `d${entry.sides}` },
    { label: `${entry.qty} dé${entry.qty > 1 ? "s" : ""}` },
  ];

  if (toneBadge) {
    badges.unshift(toneBadge);
  }

  if (entry.modifier !== 0) {
    badges.push({
      label: `Mod. ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`,
      tone: entry.modifier > 0 ? "success" : "failure",
    });
  }

  const lines = [
    `Valeurs : ${formatValues(entry.natural_values)}`,
    entry.sign === -1
      ? `Valeurs appliquées : ${formatValues(entry.signed_values)}`
      : null,
    `Total brut : ${entry.total_with_modifier}`,
    `Total retenu : ${entry.final_total}`,
  ].filter(Boolean) as string[];

  return {
    id: `entry-${entry.entryId}-${index}`,
    eyebrow: `Ligne ${index + 1}`,
    title: rendered?.summary ?? `Total : ${entry.final_total}`,
    subtitle: rendered?.title ?? getEntryLabel(entry),
    icon: getEntryIcon(entry),
    tone,
    badges,
    lines,
  };
}

function buildGroupSlide(result: GroupRollResult): ResultSlide {
  const rendered = renderRollResult(result.group_eval_result);
  const tone = toHeadlineTone(rendered?.tone);
  const toneBadge = getToneBadge(tone);

  const badges: ResultBadge[] = [
    { label: "Global", tone: "critical" },
    {
      label: `${result.entries.length} ligne${result.entries.length > 1 ? "s" : ""}`,
    },
    { label: `Total ${result.total}` },
  ];

  if (toneBadge) {
    badges.unshift(toneBadge);
  }

  return {
    id: `group-${result.groupId}`,
    eyebrow: result.label || "Jet complet",
    title: rendered?.summary ?? `Total : ${result.total}`,
    subtitle: rendered?.title ?? "Résumé global du lancer",
    icon: getHeadlineIcon(tone),
    tone,
    badges,
    lines: [
      `Total des lignes : ${result.entries_total}`,
      `Total final : ${result.total}`,
      result.group_eval_result
        ? "Une règle globale interprète ce jet."
        : "Chaque ligne est interprétée séparément.",
    ],
  };
}

function buildResultSlides(result: GroupRollResult): ResultSlide[] {
  const slides: ResultSlide[] = [];

  if (result.group_eval_result || result.entries.length > 1) {
    slides.push(buildGroupSlide(result));
  }

  result.entries.forEach((entry, index) => {
    slides.push(buildEntrySlide(entry, index));
  });

  if (slides.length === 0) {
    slides.push({
      id: `raw-${result.groupId}`,
      eyebrow: "Résultat brut",
      title: `Total : ${result.total}`,
      subtitle: "Aucune ligne détaillée.",
      icon: "🎲",
      tone: "neutral",
      badges: [{ label: "Brut" }],
      lines: [`Total : ${result.total}`],
    });
  }

  return slides;
}

function getResultHeadline(result: GroupRollResult): ResultHeadline {
  const evalResult = getPrimaryEvalResult(result);
  const rendered = renderRollResult(evalResult);

  if (!rendered) {
    return {
      eyebrow: "Résultat brut",
      title: `Total : ${result.total}`,
      subtitle: "Résultat numérique simple.",
      icon: "🎲",
      tone: "neutral",
    };
  }

  const tone = toHeadlineTone(rendered.tone);

  return {
    eyebrow: rendered.title,
    title: rendered.summary,
    subtitle: `Total global : ${result.total} · ${result.entries.length} entrée${result.entries.length > 1 ? "s" : ""
      }`,
    icon: getHeadlineIcon(tone),
    tone,
  };
}

function getToneColors(
  tone: ResultTone,
  theme: ReturnType<typeof useArcaneTheme>["theme"],
  rollTheme: ReturnType<typeof createRollScreenTheme>,
) {
  if (tone === "critical") {
    return {
      border: "rgba(217, 160, 55, 0.86)",
      background: "rgba(31, 24, 54, 0.88)",
      soft: "rgba(217, 160, 55, 0.15)",
      text: theme.colors.accent,
      glow: theme.colors.accent,
    };
  }

  if (tone === "success") {
    return {
      border: theme.colors.success,
      background: "rgba(15, 38, 36, 0.84)",
      soft: theme.colors.successSoft,
      text: theme.colors.success,
      glow: theme.colors.success,
    };
  }

  if (tone === "failure") {
    return {
      border: theme.colors.failure,
      background: "rgba(48, 19, 36, 0.84)",
      soft: theme.colors.failureSoft,
      text: theme.colors.failure,
      glow: theme.colors.failure,
    };
  }

  if (tone === "warning") {
    return {
      border: theme.colors.warning,
      background: "rgba(48, 35, 18, 0.84)",
      soft: theme.colors.warningSoft,
      text: theme.colors.warning,
      glow: theme.colors.warning,
    };
  }

  return {
    border: "rgba(145, 113, 255, 0.24)",
    background: "rgba(13, 19, 43, 0.72)",
    soft: "rgba(32, 41, 88, 0.52)",
    text: theme.colors.text,
    glow: rollTheme.cockpit.magicGlow,
  };
}

function DetailPill({ label, value }: { label: string; value: string }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.18)",
        borderRadius: theme.radius.pill,
        backgroundColor: "rgba(32, 41, 88, 0.52)",
        gap: 2,
      }}
    >
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.text,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

type SpecialEvent = {
  id: string;
  label: string;
  value?: string;
  tone: "neutral" | "success" | "failure" | "warning" | "critical";
  icon: string;
};

function getEvalOutcome(result: any | null | undefined): string | null {
  if (!result) return null;

  if (typeof result.outcome === "string") return result.outcome;
  if (typeof result.meta?.outcome === "string") return result.meta.outcome;

  return null;
}

function getEvalMeta(result: any | null | undefined) {
  if (!result) return {};

  return result.kind === "pipeline" ? (result.meta ?? {}) : result;
}

function collectSpecialEvents(result: GroupRollResult): SpecialEvent[] {
  const events: SpecialEvent[] = [];

  const allEvalResults = [
    result.group_eval_result,
    ...result.entries.map((entry) => entry.eval_result),
  ].filter(Boolean);

  let successCount: number | null = null;
  let complicationCount: number | null = null;
  let degreeCount: number | null = null;
  let explosionCount = 0;
  let rerollCount = 0;

  for (const evalResult of allEvalResults) {
    const outcome = getEvalOutcome(evalResult);
    const meta = getEvalMeta(evalResult);

    if (outcome === "crit_success") {
      events.push({
        id: `crit-success-${events.length}`,
        label: "Réussite critique",
        tone: "critical",
        icon: "✦",
      });
    }

    if (outcome === "crit_failure" || outcome === "crit_glitch") {
      events.push({
        id: `crit-failure-${events.length}`,
        label:
          outcome === "crit_glitch"
            ? "Échec critique + complication"
            : "Échec critique",
        tone: "failure",
        icon: "✖",
      });
    }

    if (outcome === "glitch") {
      events.push({
        id: `glitch-${events.length}`,
        label: "Complication",
        tone: "warning",
        icon: "⚠",
      });
    }

    if (typeof meta.successes === "number") {
      successCount = Math.max(successCount ?? 0, meta.successes);
    }

    if (typeof evalResult?.successes === "number") {
      successCount = Math.max(successCount ?? 0, evalResult.successes);
    }

    if (typeof meta.complications === "number") {
      complicationCount = Math.max(complicationCount ?? 0, meta.complications);
    }

    if (typeof evalResult?.fail_count === "number") {
      complicationCount = Math.max(
        complicationCount ?? 0,
        evalResult.fail_count,
      );
    }

    if (typeof meta.degrees?.degrees === "number") {
      degreeCount = Math.max(degreeCount ?? 0, meta.degrees.degrees);
    }

    if (Array.isArray(meta.steps)) {
      explosionCount += meta.steps.filter(
        (step: any) => step.op === "explode_one",
      ).length;

      rerollCount += meta.steps.filter(
        (step: any) => step.op === "reroll_one",
      ).length;
    }
  }

  if (successCount != null) {
    events.push({
      id: "success-count",
      label: "Succès",
      value: String(successCount),
      tone: successCount > 0 ? "success" : "failure",
      icon: "◎",
    });
  }

  if (complicationCount != null && complicationCount > 0) {
    events.push({
      id: "complication-count",
      label: "Faces spéciales",
      value: String(complicationCount),
      tone: "warning",
      icon: "⚠",
    });
  }

  if (degreeCount != null) {
    events.push({
      id: "degree-count",
      label: "Degrés",
      value: String(degreeCount),
      tone: degreeCount > 0 ? "success" : "neutral",
      icon: "◆",
    });
  }

  if (explosionCount > 0) {
    events.push({
      id: "explosions",
      label: "Explosions",
      value: String(explosionCount),
      tone: "critical",
      icon: "✦",
    });
  }

  if (rerollCount > 0) {
    events.push({
      id: "rerolls",
      label: "Relances",
      value: String(rerollCount),
      tone: "neutral",
      icon: "↻",
    });
  }

  const uniqueEvents = new Map<string, SpecialEvent>();

  for (const event of events) {
    const key = `${event.label}-${event.value ?? ""}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    }
  }

  return [...uniqueEvents.values()];
}

function DetailSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { theme, styles } = useArcaneTheme();

  return (
    <View
      style={{
        ...styles.cardSoft,
        backgroundColor: "rgba(28, 37, 82, 0.54)",
        borderColor: "rgba(145, 113, 255, 0.18)",
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 16,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}

function SpecialEventBadge({ event }: { event: SpecialEvent }) {
  const { theme } = useArcaneTheme();

  const colors =
    event.tone === "critical"
      ? {
        border: theme.colors.accent,
        background: theme.colors.accentSoft,
        text: theme.colors.accent,
      }
      : event.tone === "success"
        ? {
          border: theme.colors.success,
          background: theme.colors.successSoft,
          text: theme.colors.success,
        }
        : event.tone === "failure"
          ? {
            border: theme.colors.failure,
            background: theme.colors.failureSoft,
            text: theme.colors.failure,
          }
          : event.tone === "warning"
            ? {
              border: theme.colors.warning,
              background: theme.colors.warningSoft,
              text: theme.colors.warning,
            }
            : {
              border: "rgba(145, 113, 255, 0.22)",
              background: "rgba(32, 41, 88, 0.52)",
              text: theme.colors.textMuted,
            };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 13,
          fontWeight: "900",
        }}
      >
        {event.icon}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {event.label}
        {event.value ? ` · ${event.value}` : ""}
      </Text>
    </View>
  );
}

function EntryDetailCard({
  entry,
  index,
}: {
  entry: GroupRollResult["entries"][number];
  index: number;
}) {
  const { theme } = useArcaneTheme();
  const rendered = renderRollResult(entry.eval_result);
  const isNegative = entry.sign === -1;

  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 11,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isNegative
          ? "rgba(255, 92, 122, 0.28)"
          : "rgba(145, 113, 255, 0.16)",
        backgroundColor: isNegative
          ? "rgba(255, 92, 122, 0.08)"
          : "rgba(13, 19, 43, 0.54)",
        gap: 9,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
        }}
      >
        <View
          style={{
            width: 31,
            height: 31,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: isNegative
              ? "rgba(255, 92, 122, 0.62)"
              : "rgba(80, 220, 160, 0.48)",
            backgroundColor: isNegative
              ? "rgba(255, 92, 122, 0.1)"
              : "rgba(80, 220, 160, 0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: isNegative ? theme.colors.failure : theme.colors.success,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            {isNegative ? "−" : "+"}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            Ligne {index + 1} · {getEntryLabel(entry)}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "700",
              marginTop: 2,
            }}
          >
            {rendered?.summary ?? `Total : ${entry.final_total}`}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 7,
        }}
      >
        <DetailPill label="Dés" value={formatValues(entry.natural_values)} />
        <DetailPill label="Brut" value={String(entry.total_with_modifier)} />
        <DetailPill label="Retenu" value={String(entry.final_total)} />
      </View>

      {entry.eval_result ? (
        <RollResultCard
          result={entry.eval_result}
          title="Interprétation de cette ligne"
        />
      ) : null}
    </View>
  );
}

function ResultMiniBadge({ badge }: { badge: ResultBadge }) {
  const { theme } = useArcaneTheme();

  const tone = badge.tone ?? "neutral";

  const borderColor =
    tone === "critical"
      ? "rgba(217, 160, 55, 0.74)"
      : tone === "success"
        ? theme.colors.success
        : tone === "failure"
          ? theme.colors.failure
          : tone === "warning"
            ? theme.colors.warning
            : "rgba(145, 113, 255, 0.2)";

  const backgroundColor =
    tone === "critical"
      ? "rgba(217, 160, 55, 0.12)"
      : tone === "success"
        ? theme.colors.successSoft
        : tone === "failure"
          ? theme.colors.failureSoft
          : tone === "warning"
            ? theme.colors.warningSoft
            : "rgba(32, 41, 88, 0.48)";

  const color =
    tone === "critical"
      ? theme.colors.accent
      : tone === "success"
        ? theme.colors.success
        : tone === "failure"
          ? theme.colors.failure
          : tone === "warning"
            ? theme.colors.warning
            : theme.colors.textMuted;

  return (
    <View
      style={{
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor,
        backgroundColor,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color,
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

function ResultSlidePage({
  slide,
  width,
  onOpenDetails,
}: {
  slide: ResultSlide;
  width: number;
  onOpenDetails: () => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);
  const toneColors = getToneColors(slide.tone, theme, rollTheme);

  const pageWidth = width > 0 ? Math.max(240, width - 22) : 280;

  return (
    <View
      style={{
        width: pageWidth,
        minHeight: 88,
        paddingVertical: 2,
        paddingHorizontal: 0,
        justifyContent: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
            backgroundColor: toneColors.soft,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: toneColors.glow,
            shadowOpacity: 0.22,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
            elevation: 4,
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
            {slide.icon}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            ✦ {slide.eyebrow}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: toneColors.text,
              fontSize: 19,
              fontWeight: "900",
              letterSpacing: -0.45,
              lineHeight: 23,
            }}
          >
            {slide.title}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {slide.subtitle}
          </Text>
        </View>

        <Pressable
          onPress={onOpenDetails}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.22)",
            backgroundColor: pressed
              ? "rgba(32, 41, 88, 0.72)"
              : "rgba(32, 41, 88, 0.52)",
            opacity: pressed ? 0.84 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "900",
            }}
          >
            Détails
          </Text>
        </Pressable>
      </View>

      {slide.badges.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 5,
          }}
        >
          {slide.badges.slice(0, 5).map((badge, index) => (
            <ResultMiniBadge
              key={`${slide.id}-badge-${index}-${badge.label}`}
              badge={badge}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ResultSlideDots({
  count,
  activeIndex,
  scrollX,
  pageWidth,
}: {
  count: number;
  activeIndex: number;
  scrollX: Animated.Value;
  pageWidth: number;
}) {
  const { theme } = useArcaneTheme();

  if (count <= 1) return null;

  const dotSize = 6;
  const activeDotWidth = 16;
  const gap = 5;
  const step = dotSize + gap;

  const translateX = scrollX.interpolate({
    inputRange: Array.from({ length: count }).map(
      (_, index) => index * Math.max(1, pageWidth),
    ),
    outputRange: Array.from({ length: count }).map((_, index) => index * step),
    extrapolate: "clamp",
  });

  return (
    <View
      style={{
        height: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: count * dotSize + (count - 1) * gap + activeDotWidth - dotSize,
          height: 10,
          position: "relative",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap,
            alignItems: "center",
          }}
        >
          {Array.from({ length: count }).map((_, index) => {
            const active = index === activeIndex;

            return (
              <View
                key={`result-dot-bg-${index}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: theme.radius.pill,
                  backgroundColor: "rgba(145, 113, 255, 0.24)",
                  opacity: active ? 0.3 : 0.72,
                }}
              />
            );
          })}
        </View>

        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 2,
            width: activeDotWidth,
            height: dotSize,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.accent,
            transform: [{ translateX }],
          }}
        />
      </View>
    </View>
  );
}

function ResultDetailsModal({
  visible,
  result,
  headline,
  onClose,
}: {
  visible: boolean;
  result: GroupRollResult | null;
  headline: ResultHeadline | null;
  onClose: () => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!result || !headline) return null;

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
            maxHeight: "86%",
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
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: theme.typography.tiny,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.9,
                }}
              >
                ✦ Détails du lancer
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
                {headline.title}
              </Text>

              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {headline.subtitle}
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
              gap: theme.spacing.md,
              paddingBottom: theme.spacing.md,
            }}
          >
            {(() => {
              const specialEvents = collectSpecialEvents(result);

              return (
                <>
                  <DetailSection
                    title="Résumé"
                    subtitle="Vue globale du lancer et de son résultat retenu."
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: theme.spacing.sm,
                      }}
                    >
                      <DetailPill
                        label="Total final"
                        value={String(result.total)}
                      />
                      <DetailPill
                        label="Total lignes"
                        value={String(result.entries_total)}
                      />
                      <DetailPill
                        label="Lignes"
                        value={String(result.entries.length)}
                      />
                      <DetailPill label="Type" value={headline.eyebrow} />
                    </View>
                  </DetailSection>

                  {specialEvents.length > 0 ? (
                    <DetailSection
                      title="Événements spéciaux"
                      subtitle="Critiques, complications, explosions, relances ou degrés détectés."
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {specialEvents.map((event) => (
                          <SpecialEventBadge key={event.id} event={event} />
                        ))}
                      </View>
                    </DetailSection>
                  ) : null}

                  {result.group_eval_result ? (
                    <DetailSection
                      title="Interprétation du jet complet"
                      subtitle="Résultat calculé sur l’ensemble du lancer."
                    >
                      <RollResultCard
                        result={result.group_eval_result}
                        title="Résultat de groupe"
                      />
                    </DetailSection>
                  ) : null}

                  <DetailSection
                    title="Lignes de dés"
                    subtitle="Chaque ligne du jet préparé avec ses valeurs et son interprétation."
                  >
                    <View style={{ gap: 10 }}>
                      {result.entries.map((entry, index) => (
                        <EntryDetailCard
                          key={`result-entry-${index}-${entry.entryId}`}
                          entry={entry}
                          index={index}
                        />
                      ))}
                    </View>
                  </DetailSection>
                </>
              );
            })()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const appearAnim = useRef(new Animated.Value(result ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const slideScrollX = useRef(new Animated.Value(0)).current;

  const headline = result ? getResultHeadline(result) : null;

  const slides = useMemo(
    () => (result ? buildResultSlides(result) : []),
    [result],
  );

  const pageWidth = panelWidth > 0 ? Math.max(240, panelWidth - 22) : 280;

  const activeSlide = slides[activeSlideIndex] ?? null;

  const activeTone: ResultTone =
    activeSlide?.tone ?? headline?.tone ?? "neutral";

  const toneColors = getToneColors(activeTone, theme, rollTheme);

  function updateActiveSlideFromOffset(offsetX: number) {
    const nextIndex = Math.round(offsetX / Math.max(1, pageWidth));

    const safeNextIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));

    setActiveSlideIndex((currentIndex) =>
      currentIndex === safeNextIndex ? currentIndex : safeNextIndex,
    );
  }

  const resultAnimationKey = result
    ? `${result.groupId}-${result.total}-${result.entries_total}-${result.entries.length}`
    : "empty";

  useEffect(() => {
    if (slides.length === 0) {
      setActiveSlideIndex(0);
      slideScrollX.setValue(0);
      return;
    }

    setActiveSlideIndex((currentIndex) => {
      const safeIndex = Math.max(0, Math.min(slides.length - 1, currentIndex));

      if (safeIndex !== currentIndex) {
        slideScrollX.setValue(safeIndex * Math.max(1, pageWidth));
      }

      return safeIndex;
    });
  }, [slides.length, pageWidth, slideScrollX]);

  useEffect(() => {
    if (!result) {
      appearAnim.setValue(0);
      pulseAnim.setValue(0);
      return;
    }

    appearAnim.setValue(0);
    pulseAnim.setValue(0);

    Animated.parallel([
      Animated.timing(appearAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [resultAnimationKey, result, appearAnim, pulseAnim]);

  const animatedPanelStyle = result
    ? {
      opacity: appearAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 1],
      }),
      transform: [
        {
          translateY: appearAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 0],
          }),
        },
        {
          scale: Animated.add(
            appearAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.985, 1],
            }),
            pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.018],
            }),
          ),
        },
      ],
    }
    : {
      opacity: 0.58,
    };

  const animatedGlowStyle = result
    ? {
      opacity: pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.18, activeTone === "neutral" ? 0.24 : 0.34],
      }),
      transform: [
        {
          scale: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.18],
          }),
        },
      ],
    }
    : undefined;

  return (
    <>
      <Animated.View
        onLayout={(event) => {
          setPanelWidth(event.nativeEvent.layout.width);
        }}
        style={[
          {
            minHeight: result ? 118 : 50,
            paddingVertical: result ? 6 : 6,
            paddingHorizontal: 11,
            borderRadius: rollTheme.layout.cockpitRadius,
            borderWidth: 1,
            borderColor: result
              ? toneColors.border
              : "rgba(145, 113, 255, 0.16)",
            backgroundColor: result
              ? toneColors.background
              : "rgba(13, 19, 43, 0.52)",
            overflow: "hidden",
          },
          animatedPanelStyle,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: -54,
              top: -64,
              width: 138,
              height: 138,
              borderRadius: 999,
              backgroundColor: result
                ? toneColors.glow
                : rollTheme.cockpit.magicGlow,
              opacity: result ? 0.18 : 0.07,
            },
            animatedGlowStyle,
          ]}
        />

        {result && activeTone !== "neutral" ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                right: -64,
                bottom: -74,
                width: 150,
                height: 150,
                borderRadius: 999,
                backgroundColor: toneColors.glow,
                opacity: 0.08,
              },
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.08, 0.22],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.16],
                    }),
                  },
                ],
              },
            ]}
          />
        ) : null}

        {result && headline ? (
          <View
            style={{
              gap: 6,
              overflow: "hidden",
            }}
          >
            {slides.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={pageWidth}
                  snapToOffsets={slides.map((_, index) => index * pageWidth)}
                  snapToAlignment="start"
                  disableIntervalMomentum
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    slideScrollX.setValue(offsetX);
                    updateActiveSlideFromOffset(offsetX);
                  }}
                  onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    slideScrollX.setValue(offsetX);
                    updateActiveSlideFromOffset(offsetX);
                  }}
                  contentContainerStyle={{
                    alignItems: "stretch",
                  }}
                >
                  {slides.map((slide) => (
                    <ResultSlidePage
                      key={slide.id}
                      slide={slide}
                      width={panelWidth}
                      onOpenDetails={() => setDetailsVisible(true)}
                    />
                  ))}
                </ScrollView>

                <ResultSlideDots
                  count={slides.length}
                  activeIndex={activeSlideIndex}
                  scrollX={slideScrollX}
                  pageWidth={pageWidth}
                />
              </>
            ) : null}
          </View>
        ) : (
          <View
            style={{
              minHeight: 38,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 13,
                borderWidth: 1,
                borderColor: "rgba(145, 113, 255, 0.16)",
                backgroundColor: "rgba(32, 41, 88, 0.38)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.textSubtle,
                  fontSize: 18,
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
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                En attente du lancer
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Prépare un jet, puis lance les dés.
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      <ResultDetailsModal
        visible={detailsVisible}
        result={result}
        headline={headline}
        onClose={() => setDetailsVisible(false)}
      />
    </>
  );
}
