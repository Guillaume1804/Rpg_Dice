import { View, Text, Pressable } from "react-native";
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
  onRollProfile: (profileId: string) => void;
  onRollGroup: (profileId: string, groupId: string) => void;
  onRollAll: () => void;
};

function getGroupRuleLabel(group: GroupRow, rulesMap: Record<string, RuleRow>) {
  if (!group.rule_id) return "Somme";
  return rulesMap[group.rule_id]?.name ?? "Règle inconnue";
}

export function SavedProfilesSection({
  profiles,
  results,
  rulesMap,
  onRollProfile,
  onRollGroup,
  onRollAll,
}: Props) {
  if (profiles.length === 0) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Actions enregistrées</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          Aucun profil enregistré dans cette table.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 14,
          gap: 10,
        }}
      >
        <Text style={{ fontWeight: "800", fontSize: 16 }}>Actions enregistrées</Text>

        <Text style={{ opacity: 0.72 }}>
          Lance une action précise, un profil complet, ou toute la table.
        </Text>

        <Pressable
          onPress={onRollAll}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Lancer toute la table</Text>
        </Pressable>
      </View>

      {profiles.map((p) => (
        <View
          key={p.profile.id}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 14,
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800", fontSize: 17 }}>{p.profile.name}</Text>
              <Text style={{ marginTop: 4, opacity: 0.7 }}>
                {p.groups.length} action{p.groups.length > 1 ? "s" : ""}
              </Text>
            </View>

            <Pressable
              onPress={() => onRollProfile(p.profile.id)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Lancer le profil</Text>
            </Pressable>
          </View>

          {p.groups.length === 0 ? (
            <Text style={{ opacity: 0.7 }}>
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
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700" }}>
                        {group.name}
                      </Text>

                      <Text style={{ marginTop: 4, opacity: 0.75 }}>
                        {dice.length} entrée{dice.length > 1 ? "s" : ""} • Règle : {groupRuleLabel}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => onRollGroup(p.profile.id, group.id)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>Lancer</Text>
                    </Pressable>
                  </View>

                  {!result ? (
                    <View
                      style={{
                        marginTop: 2,
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
                        marginTop: 2,
                        padding: 12,
                        borderWidth: 1,
                        borderRadius: 10,
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 13, opacity: 0.75 }}>Dernier résultat</Text>

                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "900",
                        }}
                      >
                        {result.total}
                      </Text>

                      <Text style={{ opacity: 0.8 }}>
                        Somme des entrées : {result.entries_total}
                      </Text>

                      <Text style={{ opacity: 0.8 }}>
                        Règle de groupe : {result.group_rule ? result.group_rule.name : "Somme"}
                        {result.group_eval_result
                          ? ` → ${formatRuleResult(result.group_eval_result)}`
                          : ""}
                      </Text>

                      <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1 }}>
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