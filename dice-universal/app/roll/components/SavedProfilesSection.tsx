import { View, Text } from "react-native";
import { formatRuleResult } from "../helpers";
import type { GroupRollResult } from "../../../core/roll/roll";
import type { RuleRow } from "../../../data/repositories/rulesRepo";
import type { ProfileRow } from "../../../data/repositories/profilesRepo";
import type { GroupRow, GroupDieRow } from "../../../data/repositories/groupsRepo";

type ProfileWithGroups = {
  profile: ProfileRow;
  groups: {
    group: GroupRow;
    dice: GroupDieRow[];
  }[];
};

type Props = {
  profiles: ProfileWithGroups[];
  results: GroupRollResult[];
  rulesMap: Record<string, RuleRow>;
};

function getGroupRuleLabel(group: GroupRow, rulesMap: Record<string, RuleRow>) {
  if (!group.rule_id) return "Somme (par défaut)";
  return rulesMap[group.rule_id]?.name ?? "Règle inconnue";
}

export function SavedProfilesSection({ profiles, results, rulesMap }: Props) {
  if (profiles.length === 0) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Profils</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          Aucun profil enregistré dans cette table.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 16 }}>Profils</Text>

      {profiles.map((p) => (
        <View
          key={p.profile.id}
          style={{
            marginTop: 12,
            padding: 12,
            borderWidth: 1,
            borderRadius: 14,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 17 }}>{p.profile.name}</Text>

          <Text style={{ marginTop: 4, opacity: 0.7 }}>
            {p.groups.length} action{p.groups.length > 1 ? "s" : ""}
          </Text>

          {p.groups.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>
              Aucune action enregistrée pour ce profil.
            </Text>
          ) : (
            p.groups.map(({ group, dice }) => {
              const result = results.find((x) => x.groupId === group.id);
              const groupRuleLabel = getGroupRuleLabel(group, rulesMap);

              return (
                <View
                  key={group.id}
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "700" }}>{group.name}</Text>

                  <Text style={{ marginTop: 4, opacity: 0.75 }}>
                    Règle : {groupRuleLabel}
                  </Text>

                  <Text style={{ marginTop: 4, opacity: 0.7 }}>
                    {dice.length} entrée{dice.length > 1 ? "s" : ""}
                  </Text>

                  {!result ? (
                    <View
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ opacity: 0.7 }}>
                        Pas encore de résultat pour cette action.
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontSize: 13, opacity: 0.75 }}>
                        Résultat
                      </Text>

                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 20,
                          fontWeight: "900",
                        }}
                      >
                        {result.total}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        Somme des entrées : {result.entries_total}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        Règle de groupe :{" "}
                        {result.group_rule ? result.group_rule.name : "Somme (par défaut)"}
                        {result.group_eval_result
                          ? ` → ${formatRuleResult(result.group_eval_result)}`
                          : ""}
                      </Text>

                      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
                        {result.entries.map((entry) => {
                          const ruleName = entry.rule?.name ?? "Somme";
                          const evalText = entry.eval_result
                            ? ` → ${formatRuleResult(entry.eval_result)}`
                            : "";

                          return (
                            <View key={entry.entryId} style={{ marginTop: 8 }}>
                              <Text style={{ fontWeight: "700" }}>
                                {entry.qty}d{entry.sides} {entry.sign === -1 ? "(-)" : "(+)"}
                                {entry.modifier
                                  ? ` mod ${entry.modifier >= 0 ? "+" : ""}${entry.modifier}`
                                  : ""}
                              </Text>

                              <Text style={{ marginTop: 2, opacity: 0.8 }}>
                                Valeurs : [{entry.signed_values.join(", ")}]
                              </Text>

                              <Text style={{ marginTop: 2, opacity: 0.75 }}>
                                Base {entry.base_total} → total {entry.total_with_modifier}
                              </Text>

                              <Text style={{ marginTop: 2, opacity: 0.75 }}>
                                Règle entrée : {ruleName}
                                {evalText}
                              </Text>

                              <Text style={{ marginTop: 2, fontWeight: "700" }}>
                                Final entrée : {entry.final_total}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      ))}
    </View>
  );
}