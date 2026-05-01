// dice-universal\features\tables\actionWizard\steps\ActionWizardStepBehavior.tsx

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: "700" }}>{children}</Text>;
}

function BoxInput(props: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      keyboardType={props.keyboardType ?? "default"}
      style={{
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
      }}
    />
  );
}

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
        draft.behaviorType === "highest_of_pool" ||
        draft.behaviorType === "lowest_of_pool") && (
        <>
          <FieldLabel>Comparaison</FieldLabel>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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
            <FieldLabel>Seuil de réussite</FieldLabel>
            <BoxInput
              value={draft.successThreshold}
              onChangeText={(value) => onUpdateDraft("successThreshold", value)}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Faces de réussite critique</FieldLabel>
            <BoxInput
              value={draft.critSuccessFaces}
              onChangeText={(value) => onUpdateDraft("critSuccessFaces", value)}
              placeholder="Ex: 20"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Faces d’échec critique</FieldLabel>
            <BoxInput
              value={draft.critFailureFaces}
              onChangeText={(value) => onUpdateDraft("critFailureFaces", value)}
              placeholder="Ex: 1"
            />
          </View>
        </>
      )}

      {draft.behaviorType === "threshold_degrees" && (
        <>
          <FieldLabel>Comparaison</FieldLabel>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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
              <Text style={{ fontWeight: "700" }}>Réussir en dessous (≤)</Text>
            </Pressable>

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
              <Text style={{ fontWeight: "700" }}>Réussir au-dessus (≥)</Text>
            </Pressable>
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Seuil / valeur cible</FieldLabel>
            <BoxInput
              value={draft.targetValue}
              onChangeText={(value) => onUpdateDraft("targetValue", value)}
              placeholder="Ex: 65"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Taille d’un degré</FieldLabel>
            <BoxInput
              value={draft.degreeStep}
              onChangeText={(value) => onUpdateDraft("degreeStep", value)}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Réussite critique — minimum</FieldLabel>
            <BoxInput
              value={draft.critSuccessMin}
              onChangeText={(value) => onUpdateDraft("critSuccessMin", value)}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Réussite critique — maximum</FieldLabel>
            <BoxInput
              value={draft.critSuccessMax}
              onChangeText={(value) => onUpdateDraft("critSuccessMax", value)}
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Échec critique — minimum</FieldLabel>
            <BoxInput
              value={draft.critFailureMin}
              onChangeText={(value) => onUpdateDraft("critFailureMin", value)}
              placeholder="Ex: 95"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Échec critique — maximum</FieldLabel>
            <BoxInput
              value={draft.critFailureMax}
              onChangeText={(value) => onUpdateDraft("critFailureMax", value)}
              placeholder="Ex: 100"
              keyboardType="numeric"
            />
          </View>
        </>
      )}

      {draft.behaviorType === "custom_pipeline" && (
        <>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 8,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Pipeline personnalisé</Text>
            <Text style={{ opacity: 0.72 }}>
              Combine plusieurs opérations pour créer une règle avancée.
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Relancer les faces</FieldLabel>
            <BoxInput
              value={draft.pipelineRerollFaces}
              onChangeText={(value) =>
                onUpdateDraft("pipelineRerollFaces", value)
              }
              placeholder="Ex: 1 ou 1,2"
            />

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => onUpdateDraft("pipelineRerollOnce", true)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.pipelineRerollOnce ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Une seule fois</Text>
              </Pressable>

              <Pressable
                onPress={() => onUpdateDraft("pipelineRerollOnce", false)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: !draft.pipelineRerollOnce ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Tant que possible</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Explosion sur les faces</FieldLabel>
            <BoxInput
              value={draft.pipelineExplodeFaces}
              onChangeText={(value) =>
                onUpdateDraft("pipelineExplodeFaces", value)
              }
              placeholder="Ex: 6 ou 10"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Garder les meilleurs dés</FieldLabel>
            <BoxInput
              value={draft.pipelineKeepHighest}
              onChangeText={(value) =>
                onUpdateDraft("pipelineKeepHighest", value)
              }
              placeholder="Ex: 2"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Garder les plus faibles dés</FieldLabel>
            <BoxInput
              value={draft.pipelineKeepLowest}
              onChangeText={(value) =>
                onUpdateDraft("pipelineKeepLowest", value)
              }
              placeholder="Ex: 2"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Retirer les meilleurs dés</FieldLabel>
            <BoxInput
              value={draft.pipelineDropHighest}
              onChangeText={(value) =>
                onUpdateDraft("pipelineDropHighest", value)
              }
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Retirer les plus faibles dés</FieldLabel>
            <BoxInput
              value={draft.pipelineDropLowest}
              onChangeText={(value) =>
                onUpdateDraft("pipelineDropLowest", value)
              }
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Compter les succès à partir de</FieldLabel>
            <BoxInput
              value={draft.pipelineCountSuccessAtOrAbove}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCountSuccessAtOrAbove", value)
              }
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Compter les faces exactes</FieldLabel>
            <BoxInput
              value={draft.pipelineCountEqualFaces}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCountEqualFaces", value)
              }
              placeholder="Ex: 1 ou 6,10"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Compter une plage — minimum</FieldLabel>
            <BoxInput
              value={draft.pipelineCountRangeMin}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCountRangeMin", value)
              }
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Compter une plage — maximum</FieldLabel>
            <BoxInput
              value={draft.pipelineCountRangeMax}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCountRangeMax", value)
              }
              placeholder="Ex: 3"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Sortie finale</FieldLabel>

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "sum", label: "Somme" },
                { key: "values", label: "Valeurs" },
                { key: "successes", label: "Succès" },
                { key: "count_equal", label: "Faces exactes" },
                { key: "count_range", label: "Plage" },
                { key: "first_value", label: "Première valeur" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() =>
                    onUpdateDraft(
                      "pipelineOutput",
                      option.key as ActionWizardDraft["pipelineOutput"],
                    )
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderRadius: 10,
                    opacity: draft.pipelineOutput === option.key ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Comparer la sortie finale à un seuil</FieldLabel>
            <BoxInput
              value={draft.pipelineSuccessThreshold}
              onChangeText={(value) =>
                onUpdateDraft("pipelineSuccessThreshold", value)
              }
              placeholder="Optionnel, ex: 10"
              keyboardType="numeric"
            />

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => onUpdateDraft("pipelineCompare", "gte")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.pipelineCompare === "gte" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>≥ seuil</Text>
              </Pressable>

              <Pressable
                onPress={() => onUpdateDraft("pipelineCompare", "lte")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.pipelineCompare === "lte" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>≤ seuil</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Faces de réussite critique</FieldLabel>
            <BoxInput
              value={draft.pipelineCritSuccessFaces}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCritSuccessFaces", value)
              }
              placeholder="Optionnel, ex: 6"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Faces d’échec critique</FieldLabel>
            <BoxInput
              value={draft.pipelineCritFailureFaces}
              onChangeText={(value) =>
                onUpdateDraft("pipelineCritFailureFaces", value)
              }
              placeholder="Optionnel, ex: 1"
            />
          </View>
        </>
      )}

      {draft.behaviorType === "success_pool" && (
        <>
          <View style={{ gap: 8 }}>
            <FieldLabel>Réussite à partir de</FieldLabel>
            <BoxInput
              value={draft.successAtOrAbove}
              onChangeText={(value) => onUpdateDraft("successAtOrAbove", value)}
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Faces d’échec spécial</FieldLabel>
            <BoxInput
              value={draft.failFaces}
              onChangeText={(value) => onUpdateDraft("failFaces", value)}
              placeholder="Ex: 1"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Règle de complication</FieldLabel>

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

      {draft.behaviorType === "sum_total" && (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            gap: 6,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Somme totale</Text>
          <Text style={{ opacity: 0.72 }}>
            Tous les dés lancés seront additionnés pour produire un total
            simple.
          </Text>
        </View>
      )}

      {(draft.behaviorType === "keep_highest_n" ||
        draft.behaviorType === "keep_lowest_n") && (
        <>
          <View style={{ gap: 8 }}>
            <FieldLabel>
              {draft.behaviorType === "keep_highest_n"
                ? "Nombre de meilleurs dés à garder"
                : "Nombre de pires dés à garder"}
            </FieldLabel>

            <BoxInput
              value={draft.keepCount}
              onChangeText={(value) => onUpdateDraft("keepCount", value)}
              placeholder="Ex: 3"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Mode de résultat</FieldLabel>

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => onUpdateDraft("resultMode", "sum")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.resultMode === "sum" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Somme des dés gardés</Text>
              </Pressable>

              <Pressable
                onPress={() => onUpdateDraft("resultMode", "values")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.resultMode === "values" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Liste des dés gardés</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {(draft.behaviorType === "drop_highest_n" ||
        draft.behaviorType === "drop_lowest_n") && (
        <>
          <View style={{ gap: 8 }}>
            <FieldLabel>
              {draft.behaviorType === "drop_highest_n"
                ? "Nombre de meilleurs dés à retirer"
                : "Nombre de pires dés à retirer"}
            </FieldLabel>

            <BoxInput
              value={draft.dropCount}
              onChangeText={(value) => onUpdateDraft("dropCount", value)}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </View>

          <View style={{ gap: 8 }}>
            <FieldLabel>Mode de résultat</FieldLabel>

            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => onUpdateDraft("resultMode", "sum")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.resultMode === "sum" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Somme restante</Text>
              </Pressable>

              <Pressable
                onPress={() => onUpdateDraft("resultMode", "values")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: draft.resultMode === "values" ? 1 : 0.7,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Liste restante</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {(draft.behaviorType === "banded_sum" ||
        draft.behaviorType === "table_lookup") && (
        <>
          <FieldLabel>
            {draft.behaviorType === "banded_sum" ? "Paliers" : "Intervalles"}
          </FieldLabel>

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
              <BoxInput
                value={row.min}
                onChangeText={(value) => onUpdateRangeRow(index, "min", value)}
                placeholder="Min"
                keyboardType="numeric"
              />

              <BoxInput
                value={row.max}
                onChangeText={(value) => onUpdateRangeRow(index, "max", value)}
                placeholder="Max"
                keyboardType="numeric"
              />

              <BoxInput
                value={row.label}
                onChangeText={(value) =>
                  onUpdateRangeRow(index, "label", value)
                }
                placeholder="Label"
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
