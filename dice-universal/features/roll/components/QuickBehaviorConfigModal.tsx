// dice-universal/features/roll/components/QuickBehaviorConfigModal.tsx

import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import {
  getRuleBehaviorDefinition,
  type RuleBehaviorKey,
} from "../../../core/rules/behaviorRegistry";

type RangeRow = { min: string; max: string; label: string };

type Props = {
  visible: boolean;
  pendingBehaviorKey: RuleBehaviorKey | null;
  pendingBehaviorLabel: string;

  configKeepCount: string;
  configDropCount: string;
  configResultMode: string;
  configCompare: "gte" | "lte";
  configSuccessThreshold: string;
  configCritSuccessFaces: string;
  configCritFailureFaces: string;
  configSuccessAtOrAbove: string;
  configFailFaces: string;
  configGlitchRule: string;
  configRanges: RangeRow[];

  onChangeKeepCount: (value: string) => void;
  onChangeDropCount: (value: string) => void;
  onChangeResultMode: (value: string) => void;
  onChangeCompare: (value: "gte" | "lte") => void;
  onChangeSuccessThreshold: (value: string) => void;
  onChangeCritSuccessFaces: (value: string) => void;
  onChangeCritFailureFaces: (value: string) => void;
  onChangeSuccessAtOrAbove: (value: string) => void;
  onChangeFailFaces: (value: string) => void;
  onChangeGlitchRule: (value: string) => void;
  onUpdateRange: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;

  onClose: () => void;
  onConfirm: () => void;
};

export function QuickBehaviorConfigModal({
  visible,
  pendingBehaviorKey,
  pendingBehaviorLabel,

  configKeepCount,
  configDropCount,
  configResultMode,
  configCompare,
  configSuccessThreshold,
  configCritSuccessFaces,
  configCritFailureFaces,
  configSuccessAtOrAbove,
  configFailFaces,
  configGlitchRule,
  configRanges,

  onChangeKeepCount,
  onChangeDropCount,
  onChangeResultMode,
  onChangeCompare,
  onChangeSuccessThreshold,
  onChangeCritSuccessFaces,
  onChangeCritFailureFaces,
  onChangeSuccessAtOrAbove,
  onChangeFailFaces,
  onChangeGlitchRule,
  onUpdateRange,

  onClose,
  onConfirm,
}: Props) {
  if (!visible) return null;

  const behavior = pendingBehaviorKey
    ? getRuleBehaviorDefinition(pendingBehaviorKey)
    : null;

  function getFieldValue(key: string) {
    switch (key) {
      case "keepCount":
        return configKeepCount;
      case "dropCount":
        return configDropCount;
      case "resultMode":
        return configResultMode;
      case "compare":
        return configCompare;
      case "successThreshold":
        return configSuccessThreshold;
      case "critSuccessFaces":
        return configCritSuccessFaces;
      case "critFailureFaces":
        return configCritFailureFaces;
      case "successAtOrAbove":
        return configSuccessAtOrAbove;
      case "failFaces":
        return configFailFaces;
      case "glitchRule":
        return configGlitchRule;
      default:
        return "";
    }
  }

  function setFieldValue(key: string, value: string) {
    switch (key) {
      case "keepCount":
        onChangeKeepCount(value);
        return;
      case "dropCount":
        onChangeDropCount(value);
        return;
      case "resultMode":
        onChangeResultMode(value === "values" ? "values" : "sum");
        return;
      case "compare":
        onChangeCompare(value === "lte" ? "lte" : "gte");
        return;
      case "successThreshold":
        onChangeSuccessThreshold(value);
        return;
      case "critSuccessFaces":
        onChangeCritSuccessFaces(value);
        return;
      case "critFailureFaces":
        onChangeCritFailureFaces(value);
        return;
      case "successAtOrAbove":
        onChangeSuccessAtOrAbove(value);
        return;
      case "failFaces":
        onChangeFailFaces(value);
        return;
      case "glitchRule":
        onChangeGlitchRule(value);
        return;
      default:
        return;
    }
  }

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
          maxHeight: "90%",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800" }}>
          Configurer {pendingBehaviorLabel}
        </Text>

        {!behavior ? (
          <Text style={{ opacity: 0.72 }}>Aucun comportement sélectionné.</Text>
        ) : null}

        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {behavior?.fields.map((field) => {
            if (field.type === "text" || field.type === "number") {
              return (
                <View key={field.key} style={{ gap: 6 }}>
                  <Text style={{ opacity: 0.72 }}>{field.label}</Text>

                  <View
                    style={{
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <TextInput
                      value={getFieldValue(field.key)}
                      onChangeText={(value) => setFieldValue(field.key, value)}
                      keyboardType={
                        field.type === "number" ? "number-pad" : "default"
                      }
                      placeholder={field.placeholder}
                      style={{ fontSize: 16 }}
                    />
                  </View>
                </View>
              );
            }

            if (field.type === "select") {
              return (
                <View key={field.key} style={{ gap: 6 }}>
                  <Text style={{ opacity: 0.72 }}>{field.label}</Text>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {field.options.map((option) => {
                      const isSelected =
                        getFieldValue(field.key) === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setFieldValue(field.key, option.value)}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderRadius: 10,
                            opacity: isSelected ? 1 : 0.7,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: isSelected ? "700" : "400",
                            }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            }

            if (field.type === "ranges") {
              return (
                <View key={field.key} style={{ gap: 8 }}>
                  <Text style={{ opacity: 0.72 }}>{field.label}</Text>

                  {configRanges.map((row, index) => (
                    <View
                      key={`${pendingBehaviorKey}-range-${index}`}
                      style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 10,
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        Plage {index + 1}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                          }}
                        >
                          <TextInput
                            value={row.min}
                            onChangeText={(value) =>
                              onUpdateRange(index, "min", value)
                            }
                            keyboardType="number-pad"
                            placeholder="Min"
                            style={{ fontSize: 16 }}
                          />
                        </View>

                        <View
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                          }}
                        >
                          <TextInput
                            value={row.max}
                            onChangeText={(value) =>
                              onUpdateRange(index, "max", value)
                            }
                            keyboardType="number-pad"
                            placeholder="Max"
                            style={{ fontSize: 16 }}
                          />
                        </View>
                      </View>

                      <View
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      >
                        <TextInput
                          value={row.label}
                          onChangeText={(value) =>
                            onUpdateRange(index, "label", value)
                          }
                          placeholder="Label"
                          style={{ fontSize: 16 }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              );
            }

            return null;
          })}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text>Annuler</Text>
          </Pressable>

          <Pressable
            onPress={onConfirm}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Valider</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
