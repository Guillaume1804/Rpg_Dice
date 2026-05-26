// dice-universal/features/roll/premium/PremiumResultCard.tsx

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    Animated,
    Easing,
    ScrollView,
    Text,
    View,
} from "react-native";

import type { GroupRollResult } from "../../../core/roll/roll";
import {
    PremiumBottomSheet,
    PremiumPill,
    PremiumPressable,
    PremiumSurface,
    PremiumText,
} from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import { RollResultCard } from "../components/RollResultCard";
import { renderRollResult } from "../renderers/rollResultRenderer";

type PremiumResultCardProps = {
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

type SpecialEvent = {
    id: string;
    label: string;
    value?: string;
    tone: ResultTone;
    icon: string;
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
    if (tone === "failure") return "✕";
    if (tone === "warning") return "!";
    return "◇";
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
    return "◇";
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
            icon: "◇",
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
            icon: "◇",
            tone: "neutral",
        };
    }

    const tone = toHeadlineTone(rendered.tone);

    return {
        eyebrow: rendered.title,
        title: rendered.summary,
        subtitle: `Total global : ${result.total} · ${result.entries.length} entrée${result.entries.length > 1 ? "s" : ""}`,
        icon: getHeadlineIcon(tone),
        tone,
    };
}

function getPremiumToneColors(tone: ResultTone) {
    if (tone === "critical") {
        return {
            pillTone: "accent" as const,
            textTone: "accent" as const,
            borderKey: "critical" as const,
            softKey: "criticalSoft" as const,
        };
    }

    if (tone === "success") {
        return {
            pillTone: "success" as const,
            textTone: "success" as const,
            borderKey: "success" as const,
            softKey: "successSoft" as const,
        };
    }

    if (tone === "failure") {
        return {
            pillTone: "failure" as const,
            textTone: "failure" as const,
            borderKey: "failure" as const,
            softKey: "failureSoft" as const,
        };
    }

    if (tone === "warning") {
        return {
            pillTone: "warning" as const,
            textTone: "warning" as const,
            borderKey: "warning" as const,
            softKey: "warningSoft" as const,
        };
    }

    return {
        pillTone: "subtle" as const,
        textTone: "primary" as const,
        borderKey: "critical" as const,
        softKey: "criticalSoft" as const,
    };
}

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
                icon: "✕",
            });
        }

        if (outcome === "glitch") {
            events.push({
                id: `glitch-${events.length}`,
                label: "Complication",
                tone: "warning",
                icon: "!",
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
            icon: "!",
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

function ResultMiniBadge({ badge }: { badge: ResultBadge }) {
    const tone = badge.tone ?? "neutral";

    const pillTone =
        tone === "critical"
            ? "accent"
            : tone === "success"
                ? "success"
                : tone === "failure"
                    ? "failure"
                    : tone === "warning"
                        ? "warning"
                        : "subtle";

    return (
        <PremiumPill tone={pillTone} compact>
            {badge.label}
        </PremiumPill>
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
    const premium = usePremiumTheme();
    const tone = getPremiumToneColors(slide.tone);
    const toneBorder = premium.colors.state[tone.borderKey];
    const toneSoft = premium.colors.state[tone.softKey];

    const pageWidth = width > 0 ? Math.max(240, width - 22) : 280;

    return (
        <View
            style={{
                width: pageWidth,
                minHeight: 88,
                paddingVertical: 2,
                paddingHorizontal: 0,
                justifyContent: "center",
                gap: premium.spacing.sm,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: premium.spacing.sm,
                }}
            >
                <View
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: premium.radius.lg,
                        borderWidth: 1,
                        borderColor: `${toneBorder}99`,
                        backgroundColor: slide.tone === "neutral"
                            ? premium.colors.surface.secondary
                            : toneSoft,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text
                        style={{
                            color:
                                slide.tone === "neutral"
                                    ? premium.colors.text.secondary
                                    : toneBorder,
                            fontSize: 21,
                            fontWeight: "900",
                            lineHeight: 24,
                        }}
                    >
                        {slide.icon}
                    </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <PremiumText
                        variant="tiny"
                        tone="muted"
                        uppercase
                        numberOfLines={1}
                    >
                        {slide.eyebrow}
                    </PremiumText>

                    <PremiumText
                        variant="title"
                        tone={tone.textTone}
                        numberOfLines={1}
                        style={{
                            letterSpacing: -0.45,
                        }}
                    >
                        {slide.title}
                    </PremiumText>

                    <PremiumText variant="caption" tone="secondary" numberOfLines={1}>
                        {slide.subtitle}
                    </PremiumText>
                </View>

                <PremiumPressable
                    onPress={onOpenDetails}
                    style={{
                        paddingVertical: premium.spacing.xs,
                        paddingHorizontal: premium.spacing.sm,
                        borderRadius: premium.radius.pill,
                        borderWidth: 1,
                        borderColor: premium.colors.border.subtle,
                        backgroundColor: premium.colors.surface.subtle,
                    }}
                >
                    <PremiumText variant="caption" tone="secondary">
                        Détails
                    </PremiumText>
                </PremiumPressable>
            </View>

            {slide.badges.length > 0 ? (
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: premium.spacing.xs,
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
    const premium = usePremiumTheme();

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
                                key={`premium-result-dot-bg-${index}`}
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    borderRadius: premium.radius.pill,
                                    backgroundColor: premium.colors.border.default,
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
                        borderRadius: premium.radius.pill,
                        backgroundColor: premium.colors.accent.primary,
                        transform: [{ translateX }],
                    }}
                />
            </View>
        </View>
    );
}

function DetailPill({ label, value }: { label: string; value: string }) {
    return (
        <PremiumSurface
            variant="subtle"
            style={{
                flexGrow: 1,
                minWidth: 94,
                paddingVertical: 8,
                paddingHorizontal: 11,
            }}
        >
            <PremiumText variant="tiny" tone="muted" uppercase>
                {label}
            </PremiumText>

            <PremiumText variant="caption" tone="primary" numberOfLines={1}>
                {value}
            </PremiumText>
        </PremiumSurface>
    );
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
    const premium = usePremiumTheme();

    return (
        <PremiumSurface variant="secondary">
            <View style={{ gap: premium.spacing.sm }}>
                <View style={{ gap: 2 }}>
                    <PremiumText variant="bodyStrong">{title}</PremiumText>

                    {subtitle ? (
                        <PremiumText variant="caption" tone="secondary">
                            {subtitle}
                        </PremiumText>
                    ) : null}
                </View>

                {children}
            </View>
        </PremiumSurface>
    );
}

function SpecialEventBadge({ event }: { event: SpecialEvent }) {
    const tone =
        event.tone === "critical"
            ? "accent"
            : event.tone === "success"
                ? "success"
                : event.tone === "failure"
                    ? "failure"
                    : event.tone === "warning"
                        ? "warning"
                        : "subtle";

    return (
        <PremiumPill tone={tone}>
            {event.icon} {event.label}
            {event.value ? ` · ${event.value}` : ""}
        </PremiumPill>
    );
}

function EntryDetailCard({
    entry,
    index,
}: {
    entry: GroupRollResult["entries"][number];
    index: number;
}) {
    const premium = usePremiumTheme();
    const rendered = renderRollResult(entry.eval_result);
    const isNegative = entry.sign === -1;

    return (
        <View
            style={{
                paddingVertical: 10,
                paddingHorizontal: 11,
                borderRadius: premium.radius.lg,
                borderWidth: 1,
                borderColor: isNegative
                    ? "rgba(239, 111, 145, 0.28)"
                    : premium.colors.border.subtle,
                backgroundColor: isNegative
                    ? premium.colors.state.failureSoft
                    : premium.colors.surface.subtle,
                gap: premium.spacing.sm,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: premium.spacing.sm,
                }}
            >
                <View
                    style={{
                        width: 31,
                        height: 31,
                        borderRadius: premium.radius.pill,
                        borderWidth: 1,
                        borderColor: isNegative
                            ? premium.colors.state.failure
                            : premium.colors.state.success,
                        backgroundColor: isNegative
                            ? premium.colors.state.failureSoft
                            : premium.colors.state.successSoft,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text
                        style={{
                            color: isNegative
                                ? premium.colors.state.failure
                                : premium.colors.state.success,
                            fontSize: 15,
                            fontWeight: "900",
                        }}
                    >
                        {isNegative ? "−" : "+"}
                    </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                    <PremiumText variant="bodyStrong" numberOfLines={1}>
                        Ligne {index + 1} · {getEntryLabel(entry)}
                    </PremiumText>

                    <PremiumText variant="caption" tone="secondary" numberOfLines={1}>
                        {rendered?.summary ?? `Total : ${entry.final_total}`}
                    </PremiumText>
                </View>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: premium.spacing.xs,
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

function ResultDetailsSheet({
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
    const premium = usePremiumTheme();

    if (!result || !headline) return null;

    const specialEvents = collectSpecialEvents(result);

    return (
        <PremiumBottomSheet
            visible={visible}
            title="Détails du lancer"
            subtitle={headline.subtitle}
            onClose={onClose}
            maxHeight="86%"
        >
            <View style={{ gap: premium.spacing.md }}>
                <DetailSection
                    title="Résumé"
                    subtitle="Vue globale du lancer et de son résultat retenu."
                >
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: premium.spacing.sm,
                        }}
                    >
                        <DetailPill label="Total final" value={String(result.total)} />
                        <DetailPill
                            label="Total lignes"
                            value={String(result.entries_total)}
                        />
                        <DetailPill label="Lignes" value={String(result.entries.length)} />
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
                                gap: premium.spacing.xs,
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
                    <View style={{ gap: premium.spacing.sm }}>
                        {result.entries.map((entry, index) => (
                            <EntryDetailCard
                                key={`premium-result-entry-${index}-${entry.entryId}`}
                                entry={entry}
                                index={index}
                            />
                        ))}
                    </View>
                </DetailSection>
            </View>
        </PremiumBottomSheet>
    );
}

export function PremiumResultCard({ result }: PremiumResultCardProps) {
    const premium = usePremiumTheme();

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

    const tone = getPremiumToneColors(activeTone);
    const toneBorder = premium.colors.state[tone.borderKey];
    const toneSoft = premium.colors.state[tone.softKey];

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
                duration: premium.animation.normal,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: premium.animation.fast,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: premium.animation.normal,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [
        resultAnimationKey,
        result,
        appearAnim,
        pulseAnim,
        premium.animation.fast,
        premium.animation.normal,
    ]);

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
                            outputRange: [0, 0.012],
                        }),
                    ),
                },
            ],
        }
        : {
            opacity: 0.7,
        };

    const animatedGlowStyle = result
        ? {
            opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.18, activeTone === "neutral" ? 0.22 : 0.32],
            }),
            transform: [
                {
                    scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.14],
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
                        minHeight: result ? 118 : 76,
                        paddingVertical: result ? 6 : 10,
                        paddingHorizontal: 11,
                        borderRadius: premium.radius.xl,
                        borderWidth: 1,
                        borderColor: result
                            ? `${toneBorder}88`
                            : premium.colors.border.subtle,
                        backgroundColor: result
                            ? premium.colors.surface.primary
                            : premium.colors.surface.subtle,
                        overflow: "hidden",
                        ...premium.shadow.card,
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
                            borderRadius: premium.radius.pill,
                            backgroundColor: result ? toneSoft : premium.colors.accent.softer,
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
                                borderRadius: premium.radius.pill,
                                backgroundColor: toneSoft,
                                opacity: 0.08,
                            },
                            {
                                opacity: pulseAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.08, 0.18],
                                }),
                                transform: [
                                    {
                                        scale: pulseAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.12],
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
                            gap: premium.spacing.xs,
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
                            minHeight: 48,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: premium.spacing.sm,
                        }}
                    >
                        <View
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: premium.radius.lg,
                                borderWidth: 1,
                                borderColor: premium.colors.border.subtle,
                                backgroundColor: premium.colors.surface.secondary,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: premium.colors.text.subtle,
                                    fontSize: 19,
                                    fontWeight: "900",
                                }}
                            >
                                ◇
                            </Text>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                            <PremiumText variant="bodyStrong" numberOfLines={1}>
                                Prêt à lancer
                            </PremiumText>

                            <PremiumText variant="caption" tone="secondary" numberOfLines={1}>
                                Compose ton jet, puis lance les dés.
                            </PremiumText>
                        </View>
                    </View>
                )}
            </Animated.View>

            <ResultDetailsSheet
                visible={detailsVisible}
                result={result}
                headline={headline}
                onClose={() => setDetailsVisible(false)}
            />
        </>
    );
}