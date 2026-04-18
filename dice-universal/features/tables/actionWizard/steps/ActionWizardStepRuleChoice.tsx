import { Pressable, Text, View } from "react-native";
import type { RuleRow } from "../../../../data/repositories/rulesRepo";

type Props = {
  rules: RuleRow[];
  selectedRuleId: string | null;
  creationMode: "auto" | "advanced";
  onSelectRule: (ruleId: string | null) => void;
  onSelectCreationMode: (mode: "auto" | "advanced") => void;
};

export function ActionWizardStepRuleChoice({
  rules,
  selectedRuleId,
  creationMode,
  onSelectRule,
  onSelectCreationMode,
}: Props) {
  const recommendedRule = rules.length > 0 ? rules[0] : null;
  const alternativeRules = rules.slice(1);

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
              onPress={() => {
                onSelectRule(recommendedRule.id);
                onSelectCreationMode("auto");
              }}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                opacity:
                  selectedRuleId === recommendedRule.id &&
                  creationMode === "auto"
                    ? 1
                    : 0.9,
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
                {selectedRuleId === recommendedRule.id &&
                creationMode === "auto"
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
                const selected =
                  selectedRuleId === rule.id && creationMode === "auto";

                return (
                  <Pressable
                    key={rule.id}
                    onPress={() => {
                      onSelectRule(rule.id);
                      onSelectCreationMode("auto");
                    }}
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
        <Text style={{ fontWeight: "700" }}>Créer une nouvelle règle</Text>

        <Pressable
          onPress={() => {
            onSelectRule(null);
            onSelectCreationMode("auto");
          }}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            opacity:
              selectedRuleId === null && creationMode === "auto" ? 1 : 0.85,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Création automatique (recommandé)
          </Text>

          <Text style={{ marginTop: 4, opacity: 0.72 }}>
            Une règle sera générée automatiquement à partir de ta configuration.
          </Text>

          <Text style={{ marginTop: 6, fontWeight: "600" }}>
            {selectedRuleId === null && creationMode === "auto"
              ? "Sélectionnée"
              : "Utiliser ce mode"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            onSelectRule(null);
            onSelectCreationMode("advanced");
          }}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginTop: 6,
            opacity: creationMode === "advanced" ? 1 : 0.85,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 16 }}>
            Créer une règle personnalisée (avancé)
          </Text>

          <Text style={{ marginTop: 4, opacity: 0.72 }}>
            Ouvre l’éditeur complet pour concevoir une règle sur mesure.
          </Text>

          <Text style={{ marginTop: 6, fontWeight: "600" }}>
            {creationMode === "advanced" ? "Sélectionnée" : "Utiliser ce mode"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
