import { Pressable, Text, TextInput, View } from "react-native";
import type { ActionWizardDraft } from "../types";

type Props = {
  draft: ActionWizardDraft;
  onUpdateDraft: <K extends keyof ActionWizardDraft>(
    key: K,
    value: ActionWizardDraft[K],
  ) => void;
  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;
};

export function ActionWizardStepBehavior({
  draft,
  onUpdateDraft,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,
}: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Comportement de l’action
      </Text>

      <Text style={{ opacity: 0.72 }}>
        Configure la manière d’interpréter le résultat du jet.
      </Text>

      {(draft.behaviorType === "single_check" ||
        draft.behaviorType === "highest_of_pool") && (
        <>
          <Text style={{ fontWeight: "700" }}>Comparaison</Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => onUpdateDraft("compare", "gte")}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
                opacity: draft.compare === "gte" ? 1 : 0.7,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Seuil haut (≥)</Text>
            </Pressable>

            <Pressable
              onPress={() => onUpdateDraft("compare", "lte")}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderRadius: 10,
                opacity: draft.compare === "lte" ? 1 : 0.7,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Seuil bas (≤)</Text>
            </Pressable>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Seuil de réussite</Text>
            <TextInput
              value={draft.successThreshold}
              onChangeText={(value) =>
                onUpdateDraft("successThreshold", value)
              }
              placeholder="Ex: 10"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>
              Faces de réussite critique
            </Text>
            <TextInput
              value={draft.critSuccessFaces}
              onChangeText={(value) =>
                onUpdateDraft("critSuccessFaces", value)
              }
              placeholder="Ex: 20"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>
              Faces d’échec critique
            </Text>
            <TextInput
              value={draft.critFailureFaces}
              onChangeText={(value) =>
                onUpdateDraft("critFailureFaces", value)
              }
              placeholder="Ex: 1"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>
        </>
      )}

      {draft.behaviorType === "success_pool" && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>
              Réussite à partir de
            </Text>
            <TextInput
              value={draft.successAtOrAbove}
              onChangeText={(value) =>
                onUpdateDraft("successAtOrAbove", value)
              }
              placeholder="Ex: 5"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>
              Faces d’échec spécial
            </Text>
            <TextInput
              value={draft.failFaces}
              onChangeText={(value) => onUpdateDraft("failFaces", value)}
              placeholder="Ex: 1"
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>
              Règle de complication
            </Text>

            {[
              {
                key: "ones_gt_successes",
                label: "Complication si échecs spéciaux > réussites",
              },
              {
                key: "ones_gte_successes",
                label: "Complication si échecs spéciaux ≥ réussites",
              },
              {
                key: "none",
                label: "Aucune complication",
              },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() =>
                  onUpdateDraft(
                    "glitchRule",
                    option.key as ActionWizardDraft["glitchRule"],
                  )
                }
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.glitchRule === option.key ? 1 : 0.7,
                }}
              >
                <Text>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {(draft.behaviorType === "banded_sum" ||
        draft.behaviorType === "table_lookup") && (
        <>
          <Text style={{ fontWeight: "700" }}>
            {draft.behaviorType === "banded_sum"
              ? "Paliers"
              : "Intervalles"}
          </Text>

          {draft.ranges.map((row, index) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                padding: 10,
                gap: 8,
              }}
            >
              <TextInput
                value={row.min}
                onChangeText={(value) =>
                  onUpdateRangeRow(index, "min", value)
                }
                placeholder="Min"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              />

              <TextInput
                value={row.max}
                onChangeText={(value) =>
                  onUpdateRangeRow(index, "max", value)
                }
                placeholder="Max"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              />

              <TextInput
                value={row.label}
                onChangeText={(value) =>
                  onUpdateRangeRow(index, "label", value)
                }
                placeholder="Label"
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              />

              <Pressable
                onPress={() => onRemoveRangeRow(index)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignSelf: "flex-start",
                }}
              >
                <Text>Supprimer cette ligne</Text>
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={onAddRangeRow}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Ajouter une ligne</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}