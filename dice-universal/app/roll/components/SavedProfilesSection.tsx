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

export function SavedProfilesSection({ profiles, results, rulesMap }: Props) {
  if (profiles.length === 0) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "700" }}>Groupes de la table</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          Aucun profil enregistré dans cette table.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "700" }}>Groupes de la table</Text>

      {profiles.map((p) => (
        <View key={p.profile.id} style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "800", fontSize: 16 }}>{p.profile.name}</Text>

          {p.groups.map(({ group }) => {
            const r = results.find((x) => x.groupId === group.id);

            return (
              <View
                key={group.id}
                style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>

                <Text style={{ marginTop: 4, opacity: 0.75 }}>
                  règle de groupe :{" "}
                  {group.rule_id
                    ? rulesMap[group.rule_id]?.name ?? "Règle inconnue"
                    : "Somme (par défaut)"}
                </Text>

                {!r ? (
                  <Text style={{ marginTop: 8, opacity: 0.7 }}>
                    Pas encore de résultat (appuie sur Lancer).
                  </Text>
                ) : (
                  <View style={{ marginTop: 10 }}>
                    {r.entries.map((e) => {
                      const ruleName = e.rule?.name ?? "Somme";
                      const evalText = e.eval_result
                        ? ` → ${formatRuleResult(e.eval_result)}`
                        : "";

                      return (
                        <View
                          key={e.entryId}
                          style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            Entrée: {e.qty}d{e.sides} {e.sign === -1 ? "(-)" : "(+)"}
                            {e.modifier
                              ? ` mod ${e.modifier >= 0 ? "+" : ""}${e.modifier}`
                              : ""}
                          </Text>

                          <Text style={{ marginTop: 4, opacity: 0.8 }}>
                            valeurs: [{e.signed_values.join(", ")}]
                          </Text>

                          <Text style={{ marginTop: 2, opacity: 0.75 }}>
                            base {e.base_total} → total {e.total_with_modifier}
                          </Text>

                          <Text style={{ marginTop: 2, opacity: 0.75 }}>
                            règle entrée: {ruleName}
                            {evalText}
                          </Text>

                          <Text style={{ marginTop: 4, fontWeight: "800" }}>
                            final entrée: {e.final_total}
                          </Text>
                        </View>
                      );
                    })}

                    <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1 }}>
                      <Text style={{ opacity: 0.8 }}>
                        Somme des entrées : {r.entries_total}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.8 }}>
                        Règle de groupe :{" "}
                        {r.group_rule ? r.group_rule.name : "Somme (par défaut)"}
                        {r.group_eval_result
                          ? ` → ${formatRuleResult(r.group_eval_result)}`
                          : ""}
                      </Text>

                      <Text style={{ marginTop: 8, fontSize: 16, fontWeight: "900" }}>
                        Total groupe : {r.total}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}