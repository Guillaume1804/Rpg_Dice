import { Text, View } from "react-native";
import { buildActionWizardSummary } from "../helpers";
import type { ActionWizardDraft } from "../types";

type Props = {
  draft: ActionWizardDraft;
};

export function ActionWizardStepSummary({ draft }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Résumé
      </Text>

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

        <Text style={{ opacity: 0.72 }}>
          Nom : {draft.name || "—"}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Type : {draft.behaviorType ?? "—"}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Dé :{" "}
          {draft.die.sides
            ? `${draft.die.qty}d${draft.die.sides}`
            : "—"}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Modificateur : {draft.die.modifier}
        </Text>

        <Text style={{ opacity: 0.72 }}>
          Signe : {draft.die.sign === 1 ? "+" : "-"}
        </Text>
      </View>
    </View>
  );
}