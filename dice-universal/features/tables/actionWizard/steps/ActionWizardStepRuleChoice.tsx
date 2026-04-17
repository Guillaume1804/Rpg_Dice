import { Pressable, Text, View } from "react-native";
import type { RuleRow } from "../../../../data/repositories/rulesRepo";

type Props = {
  rules: RuleRow[];
  selectedRuleId: string | null;
  onSelectRule: (ruleId: string | null) => void;
};

export function ActionWizardStepRuleChoice({
  rules,
  selectedRuleId,
  onSelectRule,
}: Props) {
  const recommendedRule = rules.length > 0 ? rules[0] : null;
  const alternativeRules = rules.slice(1);

  const createNewSelected = selectedRuleId === null;

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Logique de l’action
      </Text>

      <Text style={{ opacity: 0.72 }}>
        L’application cherche d’abord si une logique existante peut être
        réutilisée pour éviter de recréer inutilement une règle.
      </Text>

      {recommendedRule ? (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Suggestion recommandée</Text>

            <Pressable
              onPress={() => onSelectRule(recommendedRule.id)}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                opacity: selectedRuleId === recommendedRule.id ? 1 : 0.9,
              }}
            >
              <Text style={{ fontWeight: "800", fontSize: 16 }}>
                {recommendedRule.name}
              </Text>

              <Text style={{ marginTop: 4, opacity: 0.72 }}>
                {recommendedRule.is_system === 1
                  ? "Logique système déjà disponible"
                  : "Logique personnalisée déjà enregistrée"}
              </Text>

              <Text style={{ marginTop: 6, fontWeight: "600" }}>
                {selectedRuleId === recommendedRule.id
                  ? "Sélectionnée"
                  : "Utiliser cette logique"}
              </Text>
            </Pressable>
          </View>

          {alternativeRules.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "700" }}>
                Autres logiques compatibles
              </Text>

              {alternativeRules.map((rule) => {
                const selected = selectedRuleId === rule.id;

                return (
                  <Pressable
                    key={rule.id}
                    onPress={() => onSelectRule(rule.id)}
                    style={{
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 12,
                      opacity: selected ? 1 : 0.75,
                    }}
                  >
                    <Text style={{ fontWeight: "800", fontSize: 16 }}>
                      {rule.name}
                    </Text>

                    <Text style={{ marginTop: 4, opacity: 0.72 }}>
                      {rule.is_system === 1
                        ? "Logique système"
                        : "Logique personnalisée"}
                    </Text>

                    <Text style={{ marginTop: 6, fontWeight: "600" }}>
                      {selected ? "Sélectionnée" : "Utiliser cette logique"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </>
      ) : (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            Aucune logique existante trouvée
          </Text>

          <Text style={{ marginTop: 6, opacity: 0.72 }}>
            Cette action ne correspond à aucune règle déjà enregistrée pour ce
            type de dé et ce comportement.
          </Text>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Autre option</Text>

        <Pressable
          onPress={() => onSelectRule(null)}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            opacity: createNewSelected ? 1 : 0.85,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Créer une nouvelle logique
          </Text>

          <Text style={{ marginTop: 4, opacity: 0.72 }}>
            Une nouvelle règle spécifique à cette action sera générée et
            enregistrée.
          </Text>

          <Text style={{ marginTop: 6, fontWeight: "600" }}>
            {createNewSelected ? "Sélectionnée" : "Créer une nouvelle logique"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
