// app/rules/components/RulesEditorHeader.tsx
import { Text } from "react-native";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

type RulesEditorHeaderProps = {
  editingRule: RuleRow | null;
};

export function RulesEditorHeader({
  editingRule,
}: RulesEditorHeaderProps) {
  return (
    <Text style={{ fontSize: 16, fontWeight: "700" }}>
      {editingRule ? "Éditer la règle" : "Créer une règle"} — pipeline
    </Text>
  );
}