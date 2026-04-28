// dice-universal\features\tables\actionWizard\steps\ActionWizardStepSummary.tsx

import { Text, View } from "react-native";
import { buildActionWizardSummary } from "../helpers";
import type { ActionWizardDraft } from "../types";

type Props = {
  draft: ActionWizardDraft;
};

export function ActionWizardStepSummary({ draft }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Résumé</Text>

      <Text style={{ opacity: 0.72 }}>
        Vérifie les informations avant de créer l’action.
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          gap: 8,
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          {buildActionWizardSummary(draft)}
        </Text>

        <Text style={{ opacity: 0.72 }}>Nom : {draft.name || "—"}</Text>

        <Text style={{ opacity: 0.72 }}>
          Type : {draft.behaviorType ?? "—"}
        </Text>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "700" }}>Dés :</Text>

          {draft.dice.map((die, index) => (
            <Text key={index} style={{ opacity: 0.72 }}>
              {die.qty}d{die.sides}
              {die.modifier !== 0
                ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                : ""}
              {die.sign === -1 ? " (-)" : ""}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
