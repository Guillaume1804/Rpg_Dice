// app/rules/components/RulesEditorPreviewSection.tsx
import { View, Text, Pressable, TextInput } from "react-native";

type Props = {
  previewValues: string;
  onChangePreviewValues: (value: string) => void;

  previewSides: string;
  onChangePreviewSides: (value: string) => void;

  previewModifier: string;
  onChangePreviewModifier: (value: string) => void;

  previewSign: string;
  onChangePreviewSign: (value: string) => void;

  previewResult: string;
  onComputePreview: () => void;
};

export function RulesEditorPreviewSection({
  previewValues,
  onChangePreviewValues,
  previewSides,
  onChangePreviewSides,
  previewModifier,
  onChangePreviewModifier,
  previewSign,
  onChangePreviewSign,
  previewResult,
  onComputePreview,
}: Props) {
  return (
    <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1 }}>
      <Text style={{ fontWeight: "700" }}>Preview</Text>

      <Text style={{ marginTop: 10 }}>values</Text>
      <TextInput
        value={previewValues}
        onChangeText={onChangePreviewValues}
        placeholder="ex: 4,6,1,5"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />

      <Text style={{ marginTop: 10 }}>sides</Text>
      <TextInput
        value={previewSides}
        onChangeText={onChangePreviewSides}
        placeholder="ex: 20"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />

      <Text style={{ marginTop: 10 }}>modifier</Text>
      <TextInput
        value={previewModifier}
        onChangeText={onChangePreviewModifier}
        placeholder="ex: 3"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />

      <Text style={{ marginTop: 10 }}>sign (+1 / -1)</Text>
      <TextInput
        value={previewSign}
        onChangeText={onChangePreviewSign}
        placeholder="1"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
      />

      <Pressable
        onPress={onComputePreview}
        style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
      >
        <Text>Calculer</Text>
      </Pressable>

      {previewResult ? (
        <Text style={{ marginTop: 10, opacity: 0.85, fontFamily: "monospace" }}>
          {previewResult}
        </Text>
      ) : null}
    </View>
  );
}