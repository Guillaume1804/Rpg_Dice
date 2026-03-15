// app/rules/components/RulesEditorOptionsSection.tsx
import { Text, Pressable, TextInput } from "react-native";
import type { PipelineOutput } from "../hooks/useRulesEditor";

type Props = {
  pipeOutput: PipelineOutput;
  onChangePipeOutput: (value: PipelineOutput) => void;

  successThreshold: string;
  onChangeSuccessThreshold: (value: string) => void;

  critSuccessFaces: string;
  onChangeCritSuccessFaces: (value: string) => void;

  critFailureFaces: string;
  onChangeCritFailureFaces: (value: string) => void;
};

const OUTPUTS: PipelineOutput[] = [
  "sum",
  "successes",
  "count_equal",
  "count_range",
  "first_value",
  "values",
  "lookup_label",
  "lookup_value",
];

export function RulesEditorOptionsSection({
  pipeOutput,
  onChangePipeOutput,
  successThreshold,
  onChangeSuccessThreshold,
  critSuccessFaces,
  onChangeCritSuccessFaces,
  critFailureFaces,
  onChangeCritFailureFaces,
}: Props) {
  return (
    <>
      <Text style={{ marginTop: 12, fontWeight: "700" }}>Options</Text>

      <Text style={{ marginTop: 8 }}>Output</Text>
      {OUTPUTS.map((output) => (
        <Pressable
          key={output}
          onPress={() => onChangePipeOutput(output)}
          style={{
            marginTop: 6,
            padding: 10,
            borderWidth: 1,
            borderRadius: 10,
            opacity: pipeOutput === output ? 1 : 0.6,
          }}
        >
          <Text style={{ fontWeight: pipeOutput === output ? "700" : "400" }}>
            {output}
          </Text>
        </Pressable>
      ))}

      <Text style={{ marginTop: 12 }}>success_threshold (optionnel)</Text>
      <TextInput
        value={successThreshold}
        onChangeText={onChangeSuccessThreshold}
        placeholder="ex: 12 (vide = null)"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
        keyboardType="numeric"
      />

      <Text style={{ marginTop: 10 }}>crit_success_faces</Text>
      <TextInput
        value={critSuccessFaces}
        onChangeText={onChangeCritSuccessFaces}
        placeholder="ex: 20"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />

      <Text style={{ marginTop: 10 }}>crit_failure_faces</Text>
      <TextInput
        value={critFailureFaces}
        onChangeText={onChangeCritFailureFaces}
        placeholder="ex: 1"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />
    </>
  );
}