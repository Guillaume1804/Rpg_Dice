import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useDb } from "../data/db/DbProvider";
import { useActiveProfile } from "../data/state/ActiveProfileProvider";
import { getProfileById, ProfileRow } from "../data/repositories/profilesRepo";
import { listGroupsByProfileId, listDiceByGroupId, GroupRow, GroupDieRow } from "../data/repositories/groupsRepo";
import { rollGroup, GroupRollResult } from "../core/roll/roll";
import { getRulesetById, RulesetRow } from "../data/repositories/rulesetsRepo";
import { evaluateRoll } from "../core/rules/evaluate";

type GroupWithDice = {
  group: GroupRow;
  dice: GroupDieRow[];
};

export default function RollScreen() {
  const db = useDb();
  const { activeProfileId } = useActiveProfile();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [groups, setGroups] = useState<GroupWithDice[]>([]);
  const [results, setResults] = useState<GroupRollResult[]>([]);
  const [ruleset, setRuleset] = useState<RulesetRow | null>(null);
  const [ignoreRules, setIgnoreRules] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const pid = useMemo(
    () => (typeof activeProfileId === "string" && activeProfileId.length > 0 ? activeProfileId : ""),
    [activeProfileId]
  );

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setResults([]);

        if (!pid) {
          setProfile(null);
          setGroups([]);
          return;
        }

        const p = await getProfileById(db, pid);
        setProfile(p);

        if (!p) {
          setGroups([]);
          return;
        }

        const r = await getRulesetById(db, p.ruleset_id);
        setRuleset(r);

        const gs = await listGroupsByProfileId(db, pid);
        const withDice: GroupWithDice[] = [];
        for (const g of gs) {
          const dice = await listDiceByGroupId(db, g.id);
          withDice.push({ group: g, dice });
        }
        setGroups(withDice);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [db, pid]);

  function onRoll() {
    if (!profile) return;
    const rolled: GroupRollResult[] = groups.map(({ group, dice }) =>
      rollGroup({
        groupId: group.id,
        label: group.name,
        dice: dice.map((d) => ({ sides: d.sides, qty: d.qty })),
      })
    );
    setResults(rolled);
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Erreur</Text>
        <Text style={{ marginTop: 8 }}>{error}</Text>
      </View>
    );
  }

  if (!pid) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>
          Aucune table active. Va dans “Mes tables” et sélectionne une table.
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet</Text>
        <Text style={{ opacity: 0.7 }}>Table active introuvable (id: {pid}).</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Jet — {profile.name}</Text>

      <Pressable
        onPress={onRoll}
        style={{ padding: 14, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Lancer</Text>
      </Pressable>

      <Pressable
        onPress={() => setIgnoreRules((v) => !v)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
      >
        <Text style={{ fontWeight: "600" }}>
          {ignoreRules ? "✅ Ignorer les règles" : "⬜ Ignorer les règles"}
        </Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", marginTop: 8 }}>Groupes :</Text>
        {groups.map(({ group, dice }) => (
          <View key={group.id} style={{ marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{group.name}</Text>
            <Text style={{ marginTop: 6, opacity: 0.7 }}>
              {dice.map((d) => `${d.qty}d${d.sides}`).join(" + ")}
            </Text>

            {results.find((r) => r.groupId === group.id) ? (
              (() => {
                const r = results.find((x) => x.groupId === group.id)!;
              
                return (
                  <View style={{ marginTop: 10 }}>
                    <Text>Résultats : {r.dice.map((d) => d.value).join(", ")}</Text>
                    <Text style={{ marginTop: 4, opacity: 0.8 }}>
                      Total : {r.total}
                    </Text>
                
                    {/* ÉVALUATION DES RÈGLES */}
                    {!ignoreRules && ruleset ? (() => {
                      const values = r.dice.map((d) => d.value);
                      const params = JSON.parse(ruleset.params_json);
                      const ev = evaluateRoll(ruleset.mode as any, params, values);
                    
                      if (ev.kind === "d20") {
                        const label =
                          ev.outcome === "crit_success"
                            ? "Réussite critique"
                            : ev.outcome === "crit_failure"
                            ? "Échec critique"
                            : ev.outcome === "success"
                            ? ev.threshold == null
                              ? "Résultat (pas de seuil)"
                              : "Réussite"
                            : "Échec";
                      
                        return (
                          <Text style={{ marginTop: 6, fontWeight: "600" }}>
                            {label}
                          </Text>
                        );
                      }
                    
                      if (ev.kind === "pool") {
                        const label =
                          ev.outcome === "crit_glitch"
                            ? "Échec critique (glitch)"
                            : ev.outcome === "glitch"
                            ? "Glitch"
                            : ev.outcome === "success"
                            ? "Réussite"
                            : "Échec";
                      
                        return (
                          <Text style={{ marginTop: 6, fontWeight: "600" }}>
                            {label} — succès: {ev.successes} / ones: {ev.ones}
                          </Text>
                        );
                      }
                    
                      return null;
                    })() : null}
                  </View>
                );            
              })()
            ) : null}

          </View>
        ))}
      </ScrollView>
    </View>
  );
}