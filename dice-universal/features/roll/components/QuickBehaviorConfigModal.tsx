// dice-universal/features/roll/components/QuickBehaviorConfigModal.tsx


import { View, Text, Pressable, TextInput } from "react-native";
import type { RuleBehaviorKey } from "../../../core/rules/behaviorCatalog";

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
  onUpdateRange: (index: number, key: "min" | "max" | "label", value: string) => void;

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
          Configurer {pendingBehaviorLabel}
        </Text>

        {(pendingBehaviorKey === "keep_highest_n" ||
          pendingBehaviorKey === "keep_lowest_n") && (
          <>
            <Text style={{ opacity: 0.72 }}>
              Combien de dés veux-tu garder ?
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configKeepCount}
                onChangeText={onChangeKeepCount}
                keyboardType="number-pad"
                placeholder="Nombre à garder"
                style={{ fontSize: 16 }}
              />
            </View>
          </>
        )}

        {(pendingBehaviorKey === "drop_highest_n" ||
          pendingBehaviorKey === "drop_lowest_n") && (
          <>
            <Text style={{ opacity: 0.72 }}>
              Combien de dés veux-tu retirer ?
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configDropCount}
                onChangeText={onChangeDropCount}
                keyboardType="number-pad"
                placeholder="Nombre à retirer"
                style={{ fontSize: 16 }}
              />
            </View>
          </>
        )}

        {pendingBehaviorKey === "single_check" && (
          <>
            <Text style={{ opacity: 0.72 }}>Type de comparaison</Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { key: "gte", label: "≥ seuil" },
                { key: "lte", label: "≤ seuil" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => onChangeCompare(option.key as "gte" | "lte")}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: configCompare === option.key ? 1 : 0.7,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: configCompare === option.key ? "700" : "400",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ opacity: 0.72 }}>Seuil de réussite</Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configSuccessThreshold}
                onChangeText={onChangeSuccessThreshold}
                keyboardType="number-pad"
                placeholder="Ex: 15"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>
              Faces de critique réussite (optionnel)
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configCritSuccessFaces}
                onChangeText={onChangeCritSuccessFaces}
                placeholder="Ex: 20"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>
              Faces d’échec critique (optionnel)
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configCritFailureFaces}
                onChangeText={onChangeCritFailureFaces}
                placeholder="Ex: 1"
                style={{ fontSize: 16 }}
              />
            </View>
          </>
        )}

        {pendingBehaviorKey === "success_pool" && (
          <>
            <Text style={{ opacity: 0.72 }}>Seuil de succès</Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configSuccessAtOrAbove}
                onChangeText={onChangeSuccessAtOrAbove}
                keyboardType="number-pad"
                placeholder="Ex: 5"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>Faces d’échec spécial</Text>

            <View
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={configFailFaces}
                onChangeText={onChangeFailFaces}
                placeholder="Ex: 1"
                style={{ fontSize: 16 }}
              />
            </View>

            <Text style={{ opacity: 0.72 }}>Règle de complication</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { key: "none", label: "Aucune" },
                { key: "ones_gt_successes", label: "1 > succès" },
                { key: "ones_gte_successes", label: "1 ≥ succès" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => onChangeGlitchRule(option.key)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: configGlitchRule === option.key ? 1 : 0.7,
                  }}
                >
                  <Text
                    style={{
                      fontWeight:
                        configGlitchRule === option.key ? "700" : "400",
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {(pendingBehaviorKey === "keep_highest_n" ||
          pendingBehaviorKey === "keep_lowest_n" ||
          pendingBehaviorKey === "drop_highest_n" ||
          pendingBehaviorKey === "drop_lowest_n") && (
          <>
            <Text style={{ opacity: 0.72 }}>Mode de résultat</Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {["sum", "list"].map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => onChangeResultMode(mode)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: configResultMode === mode ? 1 : 0.7,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: configResultMode === mode ? "700" : "400",
                    }}
                  >
                    {mode === "sum" ? "Somme" : "Liste"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {(pendingBehaviorKey === "table_lookup" ||
          pendingBehaviorKey === "banded_sum") && (
          <>
            <Text style={{ opacity: 0.72 }}>Plages de résultats</Text>

            <View style={{ gap: 8 }}>
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
          </>
        )}

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