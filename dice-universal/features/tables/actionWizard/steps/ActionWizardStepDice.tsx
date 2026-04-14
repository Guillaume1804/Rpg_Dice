import { Pressable, Text, TextInput, View } from "react-native";
import type { ActionWizardDraft } from "../types";

type Props = {
  die: ActionWizardDraft["die"];
  onChangeSides: (value: number | null) => void;
  onChangeQty: (value: number) => void;
  onChangeModifier: (value: number) => void;
  onChangeSign: (value: 1 | -1) => void;
};

const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNumberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function ActionWizardStepDice({
  die,
  onChangeSides,
  onChangeQty,
  onChangeModifier,
  onChangeSign,
}: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        Dés utilisés
      </Text>

      <Text style={{ opacity: 0.72 }}>
        Choisis le dé principal utilisé par cette action.
      </Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Dés standards</Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {STANDARD_DICE.map((sides) => {
            const selected = die.sides === sides;

            return (
              <Pressable
                key={sides}
                onPress={() => onChangeSides(sides)}
                style={{
                  minWidth: 64,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: selected ? 1 : 0.8,
                }}
              >
                <Text style={{ fontWeight: "800" }}>d{sides}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "700" }}>Faces du dé</Text>
        <TextInput
          value={die.sides == null ? "" : String(die.sides)}
          onChangeText={(value) => onChangeSides(toNumberOrNull(value))}
          placeholder="Ex: 6"
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
        <Text style={{ fontWeight: "700" }}>Quantité</Text>
        <TextInput
          value={String(die.qty)}
          onChangeText={(value) => onChangeQty(toNumberOrFallback(value, 1))}
          placeholder="1"
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
        <Text style={{ fontWeight: "700" }}>Modificateur</Text>
        <TextInput
          value={String(die.modifier)}
          onChangeText={(value) =>
            onChangeModifier(toNumberOrFallback(value, 0))
          }
          placeholder="0"
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
        <Text style={{ fontWeight: "700" }}>Signe</Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => onChangeSign(1)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
              opacity: die.sign === 1 ? 1 : 0.7,
            }}
          >
            <Text style={{ fontWeight: "700" }}>+</Text>
          </Pressable>

          <Pressable
            onPress={() => onChangeSign(-1)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderRadius: 10,
              opacity: die.sign === -1 ? 1 : 0.7,
            }}
          >
            <Text style={{ fontWeight: "700" }}>-</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}