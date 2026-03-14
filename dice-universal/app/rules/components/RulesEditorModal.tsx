// app/components/RulesEditorModal.tsx
import { Modal, View, Text, Pressable, TextInput, ScrollView } from "react-native";
import type {
  RuleRow,
} from "../../../data/repositories/rulesRepo";
import type {
  PipelineOutput,
  PipelineStep,
  RangeRow,
} from "../hooks/useRulesEditor";

import { RulesEditorHeader } from "./RulesEditorHeader";
import { RulesEditorFooter } from "./RulesEditorFooter";

type Props = {
  visible: boolean;
  editingRule: RuleRow | null;

  formName: string;
  onChangeFormName: (value: string) => void;

  pipeOutput: PipelineOutput;
  onChangePipeOutput: (value: PipelineOutput) => void;

  successThreshold: string;
  onChangeSuccessThreshold: (value: string) => void;

  critSuccessFaces: string;
  onChangeCritSuccessFaces: (value: string) => void;

  critFailureFaces: string;
  onChangeCritFailureFaces: (value: string) => void;

  steps: PipelineStep[];
  keepN: string;
  onChangeKeepN: (value: string) => void;

  successAt: string;
  onChangeSuccessAt: (value: string) => void;

  takeIndex: string;
  onChangeTakeIndex: (value: string) => void;

  facesInput: string;
  onChangeFacesInput: (value: string) => void;

  rangeMin: string;
  onChangeRangeMin: (value: string) => void;

  rangeMax: string;
  onChangeRangeMax: (value: string) => void;

  ranges: RangeRow[];
  onChangeRanges: (
    updater: RangeRow[] | ((prev: RangeRow[]) => RangeRow[])
  ) => void;

  previewValues: string;
  onChangePreviewValues: (value: string) => void;

  previewSides: string;
  onChangePreviewSides: (value: string) => void;

  previewModifier: string;
  onChangePreviewModifier: (value: string) => void;

  previewSign: string;
  onChangePreviewSign: (value: string) => void;

  previewResult: string;

  toFacesArray: (input: string) => number[];

  onApplyPreset: (
    preset:
      | "SUM"
      | "D20"
      | "D100_CRIT"
      | "D100_LOC"
      | "KEEP_HIGHEST"
      | "SUCCESS_POOL"
  ) => void;

  onAddStep: (step: PipelineStep) => void;
  onRemoveStepAt: (index: number) => void;
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;

  onComputePreview: () => void;
  onClose: () => void;
  onSave: () => void;
};

export function RulesEditorModal({
  visible,
  editingRule,

  formName,
  onChangeFormName,

  pipeOutput,
  onChangePipeOutput,

  successThreshold,
  onChangeSuccessThreshold,

  critSuccessFaces,
  onChangeCritSuccessFaces,

  critFailureFaces,
  onChangeCritFailureFaces,

  steps,
  keepN,
  onChangeKeepN,

  successAt,
  onChangeSuccessAt,

  takeIndex,
  onChangeTakeIndex,

  facesInput,
  onChangeFacesInput,

  rangeMin,
  onChangeRangeMin,

  rangeMax,
  onChangeRangeMax,

  ranges,
  onChangeRanges,

  previewValues,
  onChangePreviewValues,

  previewSides,
  onChangePreviewSides,

  previewModifier,
  onChangePreviewModifier,

  previewSign,
  onChangePreviewSign,

  previewResult,

  toFacesArray,

  onApplyPreset,
  onAddStep,
  onRemoveStepAt,
  onMoveStepUp,
  onMoveStepDown,

  onComputePreview,
  onClose,
  onSave,
}: Props) {
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
            maxHeight: "90%",
          }}
        >
          <RulesEditorHeader editingRule={editingRule} />

          <ScrollView style={{ marginTop: 12 }}>
            <Text>Nom</Text>
            <TextInput
              value={formName}
              onChangeText={onChangeFormName}
              placeholder="Ex: D100 Localisation"
              style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 }}
            />

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

            <Text style={{ marginTop: 12, fontWeight: "700" }}>Options</Text>

            <Text style={{ marginTop: 8 }}>Output</Text>
            {(
              [
                "sum",
                "successes",
                "count_equal",
                "count_range",
                "first_value",
                "values",
                "lookup_label",
                "lookup_value",
              ] as const
            ).map((o) => (
              <Pressable
                key={o}
                onPress={() => onChangePipeOutput(o)}
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  opacity: pipeOutput === o ? 1 : 0.6,
                }}
              >
                <Text style={{ fontWeight: pipeOutput === o ? "700" : "400" }}>{o}</Text>
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

            <Text style={{ marginTop: 14, fontWeight: "700" }}>Pipeline steps</Text>

            {steps.length === 0 ? (
              <Text style={{ marginTop: 8, opacity: 0.7 }}>
                Aucune étape. Ajoute au moins une étape.
              </Text>
            ) : (
              steps.map((s, idx) => (
                <View
                  key={idx}
                  style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    #{idx + 1} — {s.op}
                  </Text>
                  <Text style={{ marginTop: 6, opacity: 0.8 }}>{JSON.stringify(s)}</Text>

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <Pressable
                      onPress={() => onMoveStepUp(idx)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text>Monter</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => onMoveStepDown(idx)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text>Descendre</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => onRemoveStepAt(idx)}
                      style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
                    >
                      <Text>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <Text style={{ marginTop: 14, fontWeight: "700" }}>Ajouter une step</Text>

            <Pressable
              onPress={() => onAddStep({ op: "sum" })}
              style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>+ sum</Text>
            </Pressable>

            <Pressable
              onPress={() => onAddStep({ op: "sort_asc" })}
              style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>+ sort_asc</Text>
            </Pressable>

            <Pressable
              onPress={() => onAddStep({ op: "sort_desc" })}
              style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>+ sort_desc</Text>
            </Pressable>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>keep_highest</Text>
              <TextInput
                value={keepN}
                onChangeText={onChangeKeepN}
                placeholder="n"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({ op: "keep_highest", n: Math.max(0, Number(keepN || "0")) })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ keep_highest</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>keep_lowest</Text>
              <TextInput
                value={keepN}
                onChangeText={onChangeKeepN}
                placeholder="n"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({ op: "keep_lowest", n: Math.max(0, Number(keepN || "0")) })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ keep_lowest</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>drop_highest</Text>
              <TextInput
                value={keepN}
                onChangeText={onChangeKeepN}
                placeholder="n"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({ op: "drop_highest", n: Math.max(0, Number(keepN || "0")) })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ drop_highest</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>drop_lowest</Text>
              <TextInput
                value={keepN}
                onChangeText={onChangeKeepN}
                placeholder="n"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({ op: "drop_lowest", n: Math.max(0, Number(keepN || "0")) })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ drop_lowest</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>count_successes</Text>
              <TextInput
                value={successAt}
                onChangeText={onChangeSuccessAt}
                placeholder="at_or_above"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({
                    op: "count_successes",
                    at_or_above: Math.max(0, Number(successAt || "0")),
                  })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ count_successes</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>count_equal</Text>
              <TextInput
                value={facesInput}
                onChangeText={onChangeFacesInput}
                placeholder="ex: 1 ou 1,10"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() => onAddStep({ op: "count_equal", faces: toFacesArray(facesInput) })}
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ count_equal</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>count_range</Text>
              <TextInput
                value={rangeMin}
                onChangeText={onChangeRangeMin}
                placeholder="min"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <TextInput
                value={rangeMax}
                onChangeText={onChangeRangeMax}
                placeholder="max"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({
                    op: "count_range",
                    min: Number(rangeMin || "0"),
                    max: Number(rangeMax || "0"),
                  })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ count_range</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>take</Text>
              <TextInput
                value={takeIndex}
                onChangeText={onChangeTakeIndex}
                placeholder="index"
                keyboardType="numeric"
                style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10 }}
              />
              <Pressable
                onPress={() =>
                  onAddStep({ op: "take", index: Math.max(0, Number(takeIndex || "0")) })
                }
                style={{ marginTop: 8, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ take</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}>
              <Text style={{ fontWeight: "600" }}>lookup ranges</Text>

              {ranges.map((r, i) => (
                <View key={i} style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
                  <Text style={{ fontWeight: "600" }}>Range #{i + 1}</Text>

                  <TextInput
                    value={r.min}
                    onChangeText={(v) =>
                      onChangeRanges((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, min: v } : x))
                      )
                    }
                    placeholder="min"
                    keyboardType="numeric"
                    style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                  />
                  <TextInput
                    value={r.max}
                    onChangeText={(v) =>
                      onChangeRanges((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, max: v } : x))
                      )
                    }
                    placeholder="max"
                    keyboardType="numeric"
                    style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                  />
                  <TextInput
                    value={r.label}
                    onChangeText={(v) =>
                      onChangeRanges((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, label: v } : x))
                      )
                    }
                    placeholder="label"
                    style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
                  />

                  <Pressable
                    onPress={() =>
                      onChangeRanges((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    style={{ marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text>Supprimer range</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={() =>
                  onChangeRanges((prev) => [
                    ...prev,
                    { min: "1", max: "1", label: "Nouvelle entrée" },
                  ])
                }
                style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ Ajouter une range</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  onAddStep({
                    op: "lookup",
                    ranges: ranges.map((rr) => ({
                      min: Number(rr.min),
                      max: Number(rr.max),
                      label: rr.label,
                    })),
                  })
                }
                style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>+ Ajouter step lookup</Text>
              </Pressable>
            </View>

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

            <View style={{ height: 10 }} />
          </ScrollView>

          <RulesEditorFooter onClose={onClose} onSave={onSave} />
          
        </View>
      </View>
    </Modal>
  );
}