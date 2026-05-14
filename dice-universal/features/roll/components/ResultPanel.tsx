import { Text, View } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import { RollResultCard } from "./RollResultCard";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";


type ResultPanelProps = {
    result: GroupRollResult | null;
};

function formatValues(values: number[]) {
    if (!values.length) return "—";
    return values.join(" + ");
}

function getEntryLabel(entry: GroupRollResult["entries"][number]) {
    return `${entry.qty}d${entry.sides}${entry.modifier
        ? ` ${entry.modifier > 0 ? "+" : ""}${entry.modifier}`
        : ""
        }`;
}

function getResultHeadline(result: GroupRollResult) {
    const evalResult =
        result.group_eval_result ??
        result.entries.find((entry) => entry.eval_result)?.eval_result ??
        null;

    if (!evalResult) {
        return {
            title: `Total : ${result.total}`,
            subtitle: "Résultat numérique simple",
        };
    }

    const anyResult = evalResult as any;

    if (anyResult.is_critical_failure || anyResult.critical_failure) {
        return {
            title: "❌ Échec critique",
            subtitle: `Total : ${result.total}`,
        };
    }

    if (anyResult.is_critical_success || anyResult.critical_success) {
        return {
            title: "💥 Réussite critique",
            subtitle: `Total : ${result.total}`,
        };
    }

    if (anyResult.is_success === true || anyResult.success === true) {
        return {
            title: "✅ Réussite",
            subtitle: `Total : ${result.total}`,
        };
    }

    if (anyResult.is_success === false || anyResult.success === false) {
        return {
            title: "❌ Échec",
            subtitle: `Total : ${result.total}`,
        };
    }

    if (typeof anyResult.successes === "number") {
        const complication =
            anyResult.has_complication ||
            anyResult.complication ||
            anyResult.is_complication;

        return {
            title: complication
                ? `⚠️ ${anyResult.successes} succès + complication`
                : `🎯 ${anyResult.successes} succès`,
            subtitle: `Total : ${result.total}`,
        };
    }

    if (typeof anyResult.final_total === "number") {
        return {
            title: `Total : ${anyResult.final_total}`,
            subtitle: "Résultat interprété",
        };
    }

    if (typeof anyResult.label === "string" && anyResult.label.trim()) {
        return {
            title: anyResult.label,
            subtitle: `Total : ${result.total}`,
        };
    }

    return {
        title: `Total : ${result.total}`,
        subtitle: "Résultat interprété",
    };
}

export function ResultPanel({ result }: ResultPanelProps) {
    const { theme, styles } = useArcaneTheme();

    const headline = result ? getResultHeadline(result) : null;

    return (
        <View
            style={{
                ...styles.card,
                borderColor: result ? theme.colors.accent : theme.colors.border,
                backgroundColor: result
                    ? theme.colors.backgroundElevated
                    : theme.colors.surface,
                gap: theme.spacing.md,
            }}
        >
            <View style={{ gap: theme.spacing.xs }}>
                <Text
                    style={{
                        color: theme.colors.textSubtle,
                        fontSize: theme.typography.tiny,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                    }}
                >
                    Résultat
                </Text>

                {!result ? (
                    <>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontSize: 20,
                                fontWeight: "900",
                            }}
                        >
                            En attente du lancer
                        </Text>

                        <Text
                            style={{
                                color: theme.colors.textMuted,
                                lineHeight: 20,
                            }}
                        >
                            Lance un jet préparé pour révéler le résultat ici.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text
                            style={{
                                color: theme.colors.text,
                                fontSize: 22,
                                fontWeight: "900",
                            }}
                        >
                            {result.label}
                        </Text>

                        <View
                            style={{
                                marginTop: theme.spacing.xs,
                                padding: theme.spacing.md,
                                borderWidth: 1,
                                borderColor: theme.colors.accent,
                                borderRadius: theme.radius.lg,
                                backgroundColor: theme.colors.accentSoft,
                                gap: theme.spacing.xs,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 24,
                                    fontWeight: "900",
                                }}
                            >
                                {headline?.title ?? `Total : ${result.total}`}
                            </Text>

                            <Text
                                style={{
                                    color: theme.colors.textMuted,
                                    fontWeight: "700",
                                }}
                            >
                                {headline?.subtitle ?? "Résultat du lancer"}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {result ? (
                <View style={{ gap: theme.spacing.sm }}>
                    {result.group_eval_result ? (
                        <RollResultCard
                            result={result.group_eval_result}
                            title="Résultat principal"
                        />
                    ) : null}

                    {result.entries.map((entry) => (
                        <View
                            key={entry.entryId}
                            style={{
                                ...styles.cardSoft,
                                gap: theme.spacing.sm,
                            }}
                        >
                            {entry.eval_result ? (
                                <RollResultCard
                                    result={entry.eval_result}
                                    title={getEntryLabel(entry)}
                                />
                            ) : (
                                <>
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            fontWeight: "900",
                                        }}
                                    >
                                        {getEntryLabel(entry)}
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme.colors.textMuted,
                                        }}
                                    >
                                        Valeurs : {formatValues(entry.natural_values)}
                                    </Text>

                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            fontSize: 18,
                                            fontWeight: "900",
                                        }}
                                    >
                                        Total : {entry.final_total}
                                    </Text>
                                </>
                            )}
                        </View>
                    ))}

                    {!result.group_eval_result && result.entries.length > 1 ? (
                        <View
                            style={{
                                paddingTop: theme.spacing.sm,
                                borderTopWidth: 1,
                                borderTopColor: theme.colors.border,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.colors.accent,
                                    fontSize: 24,
                                    fontWeight: "900",
                                }}
                            >
                                Total : {result.total}
                            </Text>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}