// dice-universal\features\rules\components\HumanRuleEditorModal.tsx

import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RuleRow, RuleScope } from "../../../data/repositories/rulesRepo";
import { RULE_FAMILIES } from "../config/ruleFamilies";
import type { RuleFormState } from "../helpers/ruleForm";

type Props = {
  visible: boolean;
  editingRule: RuleRow | null;
  form: RuleFormState;
  formError: string | null;
  previewValues: string;
  previewSides: string;
  previewModifier: string;
  previewSign: "1" | "-1";
  previewResult: string;
  onChangePreviewValues: (value: string) => void;
  onChangePreviewSides: (value: string) => void;
  onChangePreviewModifier: (value: string) => void;
  onChangePreviewSign: (value: "1" | "-1") => void;
  onUpdateForm: <K extends keyof RuleFormState>(
    key: K,
    value: RuleFormState[K],
  ) => void;
  onUpdateRangeRow: (
    index: number,
    key: "min" | "max" | "label",
    value: string,
  ) => void;
  onAddRangeRow: () => void;
  onRemoveRangeRow: (index: number) => void;
  onComputePreview: () => void;
  onClose: () => void;
  onSave: () => void;
  onSetScope: (scope: "entry" | "group" | "both") => void;
  onSetSupportedSidesText: (value: string) => void;
};

function isScopeLocked(family: RuleFormState["family"]) {
  return family === "success_pool";
}

function getForcedScopeForFamily(
  family: RuleFormState["family"],
): RuleScope | null {
  if (family === "success_pool") return "group";
  return null;
}

function getScopeLabel(scope: RuleScope) {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Les deux";
}

export function HumanRuleEditorModal({
  visible,
  editingRule,
  form,
  formError,
  previewValues,
  previewSides,
  previewModifier,
  previewSign,
  previewResult,
  onChangePreviewValues,
  onChangePreviewSides,
  onChangePreviewModifier,
  onChangePreviewSign,
  onUpdateForm,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,
  onComputePreview,
  onClose,
  onSave,
  onSetScope,
  onSetSupportedSidesText,
}: Props) {
  const lockedScope = getForcedScopeForFamily(form.family);
  const displayedScope = lockedScope ?? form.scope;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            maxHeight: "92%",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800" }}>
            {editingRule ? "Modifier une règle" : "Créer une règle"}
          </Text>

          <ScrollView style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700" }}>Nom</Text>
            <TextInput
              value={form.name}
              onChangeText={(value) => onUpdateForm("name", value)}
              placeholder="Ex: Test d’attaque D20"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 16, fontWeight: "700" }}>
              Famille de règle
            </Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Choisis d’abord le type de comportement que cette règle doit
              avoir.
            </Text>

            {RULE_FAMILIES.map((family) => (
              <Pressable
                key={family.key}
                onPress={() => onUpdateForm("family", family.key)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: form.family === family.key ? 1 : 0.7,
                }}
              >
                <Text
                  style={{
                    fontWeight: form.family === family.key ? "700" : "400",
                  }}
                >
                  {family.label}
                </Text>
                <Text style={{ opacity: 0.7, marginTop: 2 }}>
                  {family.description}
                </Text>
              </Pressable>
            ))}

            <Text style={{ marginTop: 16, fontWeight: "700" }}>
              Dés compatibles
            </Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Indique les types de dés utilisables avec cette règle, séparés par
              des virgules.
            </Text>
            <TextInput
              value={form.supportedSidesText}
              onChangeText={(value) =>
                onUpdateForm("supportedSidesText", value)
              }
              placeholder="Ex: 6 ou 20, 100"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 16, fontWeight: "700" }}>Portée</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Détermine si la règle s’applique à une entrée de dés, à un groupe
              complet, ou aux deux.
            </Text>

            {isScopeLocked(form.family) ? (
              <View
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: 0.8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {getScopeLabel(displayedScope)}
                </Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>
                  Cette famille impose automatiquement une portée de groupe.
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 8, gap: 8 }}>
                {(["entry", "group", "both"] as RuleScope[]).map((scope) => (
                  <Pressable
                    key={scope}
                    onPress={() => onUpdateForm("scope", scope)}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      opacity: form.scope === scope ? 1 : 0.7,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: form.scope === scope ? "700" : "400",
                      }}
                    >
                      {getScopeLabel(scope)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {(form.family === "single_check" ||
              form.family === "highest_of_pool") && (
                <>
                  <Text style={{ marginTop: 16, fontWeight: "700" }}>
                    Comparaison
                  </Text>

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <Pressable
                      onPress={() => onUpdateForm("compare", "gte")}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
                        opacity: form.compare === "gte" ? 1 : 0.7,
                      }}
                    >
                      <Text>Seuil haut (≥)</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => onUpdateForm("compare", "lte")}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
                        opacity: form.compare === "lte" ? 1 : 0.7,
                      }}
                    >
                      <Text>Seuil bas (≤)</Text>
                    </Pressable>
                  </View>

                  <Text style={{ marginTop: 12 }}>Seuil de réussite</Text>
                  <TextInput
                    value={form.successThreshold}
                    onChangeText={(value) =>
                      onUpdateForm("successThreshold", value)
                    }
                    placeholder="10"
                    keyboardType="numeric"
                    style={{
                      marginTop: 8,
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                    }}
                  />

                  <Text style={{ marginTop: 12 }}>
                    Faces de réussite critique
                  </Text>
                  <TextInput
                    value={form.critSuccessFaces}
                    onChangeText={(value) =>
                      onUpdateForm("critSuccessFaces", value)
                    }
                    placeholder="20"
                    style={{
                      marginTop: 8,
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                    }}
                  />

                  <Text style={{ marginTop: 12 }}>Faces d’échec critique</Text>
                  <TextInput
                    value={form.critFailureFaces}
                    onChangeText={(value) =>
                      onUpdateForm("critFailureFaces", value)
                    }
                    placeholder="1"
                    style={{
                      marginTop: 8,
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                    }}
                  />
                </>
              )}

            {form.family === "success_pool" && (
              <>
                <Text style={{ marginTop: 16, fontWeight: "700" }}>
                  Pool de succès
                </Text>

                <Text style={{ marginTop: 12 }}>Réussite à partir de</Text>
                <TextInput
                  value={form.successAtOrAbove}
                  onChangeText={(value) =>
                    onUpdateForm("successAtOrAbove", value)
                  }
                  placeholder="5"
                  keyboardType="numeric"
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                  }}
                />

                <Text style={{ marginTop: 12 }}>Faces d’échec spécial</Text>
                <TextInput
                  value={form.failFaces}
                  onChangeText={(value) => onUpdateForm("failFaces", value)}
                  placeholder="1"
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                  }}
                />

                <Text style={{ marginTop: 12 }}>Règle de complication</Text>

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
                      onUpdateForm(
                        "glitchRule",
                        option.key as RuleFormState["glitchRule"],
                      )
                    }
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      opacity: form.glitchRule === option.key ? 1 : 0.7,
                    }}
                  >
                    <Text>{option.label}</Text>
                  </Pressable>
                ))}
              </>
            )}

            {(form.family === "banded_sum" ||
              form.family === "table_lookup") && (
                <>
                  <Text style={{ marginTop: 16, fontWeight: "700" }}>
                    {form.family === "banded_sum" ? "Paliers" : "Intervalles"}
                  </Text>
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>
                    Définis les plages numériques et le résultat associé.
                  </Text>

                  {form.ranges.map((row, index) => (
                    <View
                      key={index}
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
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
                          borderRadius: 8,
                          padding: 8,
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
                          borderRadius: 8,
                          padding: 8,
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
                          borderRadius: 8,
                          padding: 8,
                        }}
                      />

                      <Pressable
                        onPress={() => onRemoveRangeRow(index)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                      >
                        <Text>Supprimer cette ligne</Text>
                      </Pressable>
                    </View>
                  ))}

                  <Pressable
                    onPress={onAddRangeRow}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                  >
                    <Text>Ajouter une ligne</Text>
                  </Pressable>
                </>
              )}

            <Text style={{ marginTop: 18, fontWeight: "800" }}>
              Prévisualisation
            </Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              Tu peux simuler un résultat pour vérifier que la règle se comporte
              comme prévu.
            </Text>

            <Text style={{ marginTop: 12 }}>Valeurs test</Text>
            <TextInput
              value={previewValues}
              onChangeText={onChangePreviewValues}
              placeholder="1, 4, 6"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 12 }}>Faces</Text>
            <TextInput
              value={previewSides}
              onChangeText={onChangePreviewSides}
              placeholder="6"
              keyboardType="numeric"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 12 }}>Modificateur</Text>
            <TextInput
              value={previewModifier}
              onChangeText={onChangePreviewModifier}
              placeholder="0"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
              }}
            />

            <Text style={{ marginTop: 12 }}>Signe</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <Pressable
                onPress={() => onChangePreviewSign("1")}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: previewSign === "1" ? 1 : 0.7,
                }}
              >
                <Text>+</Text>
              </Pressable>

              <Pressable
                onPress={() => onChangePreviewSign("-1")}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: previewSign === "-1" ? 1 : 0.7,
                }}
              >
                <Text>-</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={onComputePreview}
              style={{
                marginTop: 12,
                padding: 10,
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Calculer un aperçu</Text>
            </Pressable>

            {formError ? (
              <Text style={{ marginTop: 10 }}>{formError}</Text>
            ) : null}

            {previewResult ? (
              <View
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text selectable>{previewResult}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text style={{ fontWeight: "700" }}>Sauvegarder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
