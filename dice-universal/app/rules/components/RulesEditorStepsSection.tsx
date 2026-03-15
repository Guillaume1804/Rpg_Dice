// app/rules/components/RulesEditorStepsSection.tsx
import { View, Text, Pressable, TextInput } from "react-native";
import type { PipelineStep, RangeRow } from "../hooks/useRulesEditor";

type Props = {
  steps: PipelineStep[];
  onRemoveStepAt: (index: number) => void;
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;
  onAddStep: (step: PipelineStep) => void;

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

  toFacesArray: (input: string) => number[];
};

export function RulesEditorStepsSection({
  steps,
  onRemoveStepAt,
  onMoveStepUp,
  onMoveStepDown,
  onAddStep,
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
  toFacesArray,
}: Props) {
  return (
    <>
      <Text style={{ marginTop: 14, fontWeight: "700" }}>Pipeline steps</Text>

      {steps.length === 0 ? (
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          Aucune étape. Ajoute au moins une étape.
        </Text>
      ) : (
        steps.map((step, index) => (
          <View
            key={index}
            style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
          >
            <Text style={{ fontWeight: "700" }}>
              #{index + 1} — {step.op}
            </Text>
            <Text style={{ marginTop: 6, opacity: 0.8 }}>{JSON.stringify(step)}</Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable
                onPress={() => onMoveStepUp(index)}
                style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>Monter</Text>
              </Pressable>

              <Pressable
                onPress={() => onMoveStepDown(index)}
                style={{ padding: 8, borderWidth: 1, borderRadius: 10 }}
              >
                <Text>Descendre</Text>
              </Pressable>

              <Pressable
                onPress={() => onRemoveStepAt(index)}
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

        {ranges.map((range, index) => (
          <View key={index} style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1 }}>
            <Text style={{ fontWeight: "600" }}>Range #{index + 1}</Text>

            <TextInput
              value={range.min}
              onChangeText={(value) =>
                onChangeRanges((prev) =>
                  prev.map((item, idx) => (idx === index ? { ...item, min: value } : item))
                )
              }
              placeholder="min"
              keyboardType="numeric"
              style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <TextInput
              value={range.max}
              onChangeText={(value) =>
                onChangeRanges((prev) =>
                  prev.map((item, idx) => (idx === index ? { ...item, max: value } : item))
                )
              }
              placeholder="max"
              keyboardType="numeric"
              style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <TextInput
              value={range.label}
              onChangeText={(value) =>
                onChangeRanges((prev) =>
                  prev.map((item, idx) => (idx === index ? { ...item, label: value } : item))
                )
              }
              placeholder="label"
              style={{ marginTop: 6, borderWidth: 1, borderRadius: 10, padding: 10 }}
            />

            <Pressable
              onPress={() =>
                onChangeRanges((prev) => prev.filter((_, idx) => idx !== index))
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
              ranges: ranges.map((item) => ({
                min: Number(item.min),
                max: Number(item.max),
                label: item.label,
              })),
            })
          }
          style={{ marginTop: 10, padding: 10, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>+ Ajouter step lookup</Text>
        </Pressable>
      </View>
    </>
  );
}