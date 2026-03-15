// app/rules/components/RulesEditorPresetsSection.tsx
import { View, Text, Pressable } from "react-native";

type Preset =
  | "SUM"
  | "D20"
  | "D100_CRIT"
  | "D100_LOC"
  | "KEEP_HIGHEST"
  | "SUCCESS_POOL";

type RulesEditorPresetsSectionProps = {
  onApplyPreset: (preset: Preset) => void;
};

export function RulesEditorPresetsSection({
  onApplyPreset,
}: RulesEditorPresetsSectionProps) {
  return (
    <>
      <Text style={{ marginTop: 12, fontWeight: "700" }}>Presets</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        <Pressable
          onPress={() => onApplyPreset("SUM")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Somme</Text>
        </Pressable>

        <Pressable
          onPress={() => onApplyPreset("D20")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>D20 crit</Text>
        </Pressable>

        <Pressable
          onPress={() => onApplyPreset("D100_CRIT")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>D100 crit</Text>
        </Pressable>

        <Pressable
          onPress={() => onApplyPreset("D100_LOC")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>D100 localisation</Text>
        </Pressable>

        <Pressable
          onPress={() => onApplyPreset("KEEP_HIGHEST")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Keep highest</Text>
        </Pressable>

        <Pressable
          onPress={() => onApplyPreset("SUCCESS_POOL")}
          style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Pool succès</Text>
        </Pressable>
      </View>
    </>
  );
}
