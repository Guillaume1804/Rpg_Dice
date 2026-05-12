import { View, Text, Pressable, ScrollView } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorRegistry";
import type { QuickBehaviorPickerOption } from "../hooks/useQuickDieBehaviorPicker";

type BehaviorDefinition = {
  key: RuleBehaviorKey;
  label: string;
  description?: string;
  defaultScope?: "entry" | "group" | "both";
};

type Props = {
  visible: boolean;
  editingDieSides: number | null;
  behaviors: QuickBehaviorPickerOption[];
  getDefinition: (behaviorKey: RuleBehaviorKey) => BehaviorDefinition | null;
  onSelectBehavior: (option: QuickBehaviorPickerOption) => void;
  onClose: () => void;
};

export function QuickDieBehaviorPickerModal({
  visible,
  editingDieSides,
  behaviors,
  getDefinition,
  onSelectBehavior,
  onClose,
}: Props) {
  if (!visible || editingDieSides === null) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 14,
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800" }}>
          Configurer d{editingDieSides}
        </Text>

        <Text style={{ opacity: 0.7 }}>
          Choisis le type de comportement à appliquer à ce jet.
        </Text>

        <ScrollView
          style={{ maxHeight: 360 }}
          contentContainerStyle={{ gap: 8 }}
          showsVerticalScrollIndicator={true}
        >
          {behaviors.map((behavior) => {
            const def = getDefinition(behavior.behaviorKey);
            if (!def) return null;

            const label = behavior.label ?? def.label;
            const description = behavior.description ?? def.description;

            return (
              <Pressable
                key={behavior.optionId}
                onPress={() => onSelectBehavior(behavior)}
                disabled={!behavior.enabled}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  gap: 4,
                  opacity: behavior.enabled ? 1 : 0.45,
                }}
              >
                <Text style={{ fontWeight: "700" }}>{label}</Text>

                {description ? (
                  <Text style={{ opacity: 0.7 }}>{description}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={{
            marginTop: 4,
            alignItems: "center",
          }}
        >
          <Text style={{ opacity: 0.6 }}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );
}