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

  pipelineRerollFaces: string;
  pipelineRerollOnce: boolean;
  pipelineExplodeFaces: string;

  pipelineKeepHighest: string;
  pipelineKeepLowest: string;
  pipelineDropHighest: string;
  pipelineDropLowest: string;

  pipelineCountSuccessAtOrAbove: string;
  pipelineCountEqualFaces: string;
  pipelineCountRangeMin: string;
  pipelineCountRangeMax: string;

  pipelineOutput:
    | "sum"
    | "successes"
    | "count_equal"
    | "count_range"
    | "first_value"
    | "values";

  pipelineSuccessThreshold: string;
  pipelineCompare: "gte" | "lte";
  pipelineCritSuccessFaces: string;
  pipelineCritFailureFaces: string;

  configTargetValue: string;
  configDegreeStep: string;
  configCritSuccessMin: string;
  configCritSuccessMax: string;
  configCritFailureMin: string;
  configCritFailureMax: string;

  onChangeTargetValue: (value: string) => void;
  onChangeDegreeStep: (value: string) => void;
  onChangeCritSuccessMin: (value: string) => void;
  onChangeCritSuccessMax: (value: string) => void;
  onChangeCritFailureMin: (value: string) => void;
  onChangeCritFailureMax: (value: string) => void;

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

  onChangePipelineRerollFaces: (value: string) => void;
  onChangePipelineRerollOnce: (value: boolean) => void;
  onChangePipelineExplodeFaces: (value: string) => void;

  onChangePipelineKeepHighest: (value: string) => void;
  onChangePipelineKeepLowest: (value: string) => void;
  onChangePipelineDropHighest: (value: string) => void;
  onChangePipelineDropLowest: (value: string) => void;

  onChangePipelineCountSuccessAtOrAbove: (value: string) => void;
  onChangePipelineCountEqualFaces: (value: string) => void;
  onChangePipelineCountRangeMin: (value: string) => void;
  onChangePipelineCountRangeMax: (value: string) => void;

  onChangePipelineOutput: (
    value:
      | "sum"
      | "successes"
      | "count_equal"
      | "count_range"
      | "first_value"
      | "values",
  ) => void;

  onChangePipelineSuccessThreshold: (value: string) => void;
  onChangePipelineCompare: (value: "gte" | "lte") => void;
  onChangePipelineCritSuccessFaces: (value: string) => void;
  onChangePipelineCritFailureFaces: (value: string) => void;

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

  configTargetValue,
  configDegreeStep,
  configCritSuccessMin,
  configCritSuccessMax,
  configCritFailureMin,
  configCritFailureMax,

  pipelineRerollFaces,
  pipelineRerollOnce,
  pipelineExplodeFaces,
  pipelineKeepHighest,
  pipelineKeepLowest,
  pipelineDropHighest,
  pipelineDropLowest,
  pipelineCountSuccessAtOrAbove,
  pipelineCountEqualFaces,
  pipelineCountRangeMin,
  pipelineCountRangeMax,
  pipelineOutput,
  pipelineSuccessThreshold,
  pipelineCompare,
  pipelineCritSuccessFaces,
  pipelineCritFailureFaces,

  onChangeTargetValue,
  onChangeDegreeStep,
  onChangeCritSuccessMin,
  onChangeCritSuccessMax,
  onChangeCritFailureMin,
  onChangeCritFailureMax,

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
  onChangePipelineRerollFaces,
  onChangePipelineRerollOnce,
  onChangePipelineExplodeFaces,
  onChangePipelineKeepHighest,
  onChangePipelineKeepLowest,
  onChangePipelineDropHighest,
  onChangePipelineDropLowest,
  onChangePipelineCountSuccessAtOrAbove,
  onChangePipelineCountEqualFaces,
  onChangePipelineCountRangeMin,
  onChangePipelineCountRangeMax,
  onChangePipelineOutput,
  onChangePipelineSuccessThreshold,
  onChangePipelineCompare,
  onChangePipelineCritSuccessFaces,
  onChangePipelineCritFailureFaces,

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
      case "targetValue":
        return configTargetValue;
      case "degreeStep":
        return configDegreeStep;
      case "critSuccessMin":
        return configCritSuccessMin;
      case "critSuccessMax":
        return configCritSuccessMax;
      case "critFailureMin":
        return configCritFailureMin;
      case "critFailureMax":
        return configCritFailureMax;

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
      case "targetValue":
        onChangeTargetValue(value);
        return;
      case "degreeStep":
        onChangeDegreeStep(value);
        return;
      case "critSuccessMin":
        onChangeCritSuccessMin(value);
        return;
      case "critSuccessMax":
        onChangeCritSuccessMax(value);
        return;
      case "critFailureMin":
        onChangeCritFailureMin(value);
        return;
      case "critFailureMax":
        onChangeCritFailureMax(value);
        return;
      default:
        return;
    }
  }

  function PipelineInput(props: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
  }) {
    return (
      <View style={{ gap: 6 }}>
        <Text style={{ opacity: 0.72 }}>{props.label}</Text>

        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={props.value}
            onChangeText={props.onChangeText}
            placeholder={props.placeholder}
            keyboardType="numbers-and-punctuation"
            style={{ fontSize: 16 }}
          />
        </View>
      </View>
    );
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
          {pendingBehaviorKey === "custom_pipeline" ? (
            <>
              <Text style={{ fontWeight: "800" }}>Relances et explosions</Text>

              <PipelineInput
                label="Relancer les faces"
                value={pipelineRerollFaces}
                onChangeText={onChangePipelineRerollFaces}
                placeholder="Ex: 1"
              />

              <Pressable
                onPress={() => onChangePipelineRerollOnce(!pipelineRerollOnce)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  Relance une seule fois : {pipelineRerollOnce ? "Oui" : "Non"}
                </Text>
              </Pressable>

              <PipelineInput
                label="Explosion sur les faces"
                value={pipelineExplodeFaces}
                onChangeText={onChangePipelineExplodeFaces}
                placeholder="Ex: 6"
              />

              <Text style={{ fontWeight: "800" }}>Garder / retirer</Text>

              <PipelineInput
                label="Garder les meilleurs"
                value={pipelineKeepHighest}
                onChangeText={onChangePipelineKeepHighest}
                placeholder="Ex: 2"
              />

              <PipelineInput
                label="Garder les plus faibles"
                value={pipelineKeepLowest}
                onChangeText={onChangePipelineKeepLowest}
                placeholder="Ex: 2"
              />

              <PipelineInput
                label="Retirer les meilleurs"
                value={pipelineDropHighest}
                onChangeText={onChangePipelineDropHighest}
                placeholder="Ex: 1"
              />

              <PipelineInput
                label="Retirer les plus faibles"
                value={pipelineDropLowest}
                onChangeText={onChangePipelineDropLowest}
                placeholder="Ex: 1"
              />

              <Text style={{ fontWeight: "800" }}>Comptage</Text>

              <PipelineInput
                label="Compter les succès à partir de"
                value={pipelineCountSuccessAtOrAbove}
                onChangeText={onChangePipelineCountSuccessAtOrAbove}
                placeholder="Ex: 5"
              />

              <PipelineInput
                label="Compter les faces exactes"
                value={pipelineCountEqualFaces}
                onChangeText={onChangePipelineCountEqualFaces}
                placeholder="Ex: 1 ou 1,2"
              />

              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <PipelineInput
                    label="Plage min"
                    value={pipelineCountRangeMin}
                    onChangeText={onChangePipelineCountRangeMin}
                    placeholder="Ex: 2"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <PipelineInput
                    label="Plage max"
                    value={pipelineCountRangeMax}
                    onChangeText={onChangePipelineCountRangeMax}
                    placeholder="Ex: 5"
                  />
                </View>
              </View>

              <Text style={{ fontWeight: "800" }}>Sortie du pipeline</Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[
                  { key: "sum", label: "Somme" },
                  { key: "successes", label: "Succès" },
                  { key: "count_equal", label: "Faces exactes" },
                  { key: "count_range", label: "Plage" },
                  { key: "first_value", label: "Première valeur" },
                  { key: "values", label: "Valeurs" },
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() =>
                      onChangePipelineOutput(
                        option.key as typeof pipelineOutput,
                      )
                    }
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderRadius: 10,
                      opacity: pipelineOutput === option.key ? 1 : 0.7,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight:
                          pipelineOutput === option.key ? "800" : "500",
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ fontWeight: "800" }}>
                Succès / critiques optionnels
              </Text>

              <PipelineInput
                label="Seuil final"
                value={pipelineSuccessThreshold}
                onChangeText={onChangePipelineSuccessThreshold}
                placeholder="Ex: 10"
              />

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => onChangePipelineCompare("gte")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: pipelineCompare === "gte" ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>≥ seuil</Text>
                </Pressable>

                <Pressable
                  onPress={() => onChangePipelineCompare("lte")}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: pipelineCompare === "lte" ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>≤ seuil</Text>
                </Pressable>
              </View>

              <PipelineInput
                label="Faces de réussite critique"
                value={pipelineCritSuccessFaces}
                onChangeText={onChangePipelineCritSuccessFaces}
                placeholder="Ex: 20"
              />

              <PipelineInput
                label="Faces d’échec critique"
                value={pipelineCritFailureFaces}
                onChangeText={onChangePipelineCritFailureFaces}
                placeholder="Ex: 1"
              />
            </>
          ) : null}
          {pendingBehaviorKey !== "custom_pipeline" &&
            behavior?.fields.map((field) => {
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
                        onChangeText={(value) =>
                          setFieldValue(field.key, value)
                        }
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
                            onPress={() =>
                              setFieldValue(field.key, option.value)
                            }
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
