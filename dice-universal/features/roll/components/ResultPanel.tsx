import { Text, View } from "react-native";
import type { GroupRollResult } from "../../../core/roll/roll";
import { RollResultCard } from "./RollResultCard";

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

export function ResultPanel({ result }: ResultPanelProps) {
    return (
        <View
            style={{
                padding: 14,
                borderWidth: 1,
                borderRadius: 18,
                gap: 12,
            }}
        >
            <View style={{ gap: 4 }}>
                <Text style={{ opacity: 0.62, fontSize: 12, fontWeight: "800" }}>
                    Résultat
                </Text>

                {!result ? (
                    <>
                        <Text style={{ fontSize: 20, fontWeight: "900" }}>
                            Aucun résultat
                        </Text>

                        <Text style={{ opacity: 0.68, lineHeight: 20 }}>
                            Lance un jet préparé pour afficher son résultat ici.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={{ fontSize: 22, fontWeight: "900" }}>
                            {result.label}
                        </Text>

                        <Text style={{ opacity: 0.72 }}>
                            Total global : {result.total}
                        </Text>
                    </>
                )}
            </View>

            {result ? (
                <View style={{ gap: 10 }}>
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
                                padding: 10,
                                borderWidth: 1,
                                borderRadius: 12,
                                gap: 8,
                            }}
                        >
                            {entry.eval_result ? (
                                <RollResultCard
                                    result={entry.eval_result}
                                    title={getEntryLabel(entry)}
                                />
                            ) : (
                                <>
                                    <Text style={{ fontWeight: "900" }}>
                                        {getEntryLabel(entry)}
                                    </Text>

                                    <Text style={{ opacity: 0.72 }}>
                                        Valeurs : {formatValues(entry.natural_values)}
                                    </Text>

                                    <Text style={{ fontSize: 18, fontWeight: "900" }}>
                                        Total : {entry.final_total}
                                    </Text>
                                </>
                            )}
                        </View>
                    ))}

                    {!result.group_eval_result && result.entries.length > 1 ? (
                        <View
                            style={{
                                paddingTop: 10,
                                borderTopWidth: 1,
                            }}
                        >
                            <Text style={{ fontSize: 24, fontWeight: "900" }}>
                                Total : {result.total}
                            </Text>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}