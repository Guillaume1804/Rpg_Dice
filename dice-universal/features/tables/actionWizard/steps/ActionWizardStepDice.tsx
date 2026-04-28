// dice-universal\features\tables\actionWizard\steps\ActionWizardStepDice.tsx

import { Pressable, Text, TextInput, View } from "react-native";
import type { ActionDieDraft } from "../types";

type Props = {
  dice: ActionDieDraft[];
  onChangeDie: <K extends keyof ActionDieDraft>(
    index: number,
    key: K,
    value: ActionDieDraft[K],
  ) => void;
  onAddDie: () => void;
  onRemoveDie: (index: number) => void;

  /**
   * Compat temporaire si un appel ancien passe encore par `die`.
   */
  fallbackDie?: ActionDieDraft;
  onChangeFallbackDie?: <K extends keyof ActionDieDraft>(
    key: K,
    value: ActionDieDraft[K],
  ) => void;
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

function getSafeDice(dice: ActionDieDraft[], fallbackDie?: ActionDieDraft) {
  if (dice.length > 0) return dice;

  if (fallbackDie) return [fallbackDie];

  return [
    {
      sides: null,
      qty: 1,
      modifier: 0,
      sign: 1 as const,
    },
  ];
}

export function ActionWizardStepDice({
  dice,
  onChangeDie,
  onAddDie,
  onRemoveDie,
  fallbackDie,
  onChangeFallbackDie,
}: Props) {
  const safeDice = getSafeDice(dice, fallbackDie);

  function updateDie<K extends keyof ActionDieDraft>(
    index: number,
    key: K,
    value: ActionDieDraft[K],
  ) {
    if (dice.length === 0 && index === 0 && onChangeFallbackDie) {
      onChangeFallbackDie(key, value);
      return;
    }

    onChangeDie(index, key, value);
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Dés utilisés</Text>

      <Text style={{ opacity: 0.72 }}>
        Configure une ou plusieurs lignes de dés pour cette action.
      </Text>

      {safeDice.map((die, index) => (
        <View
          key={`action-die-${index}`}
          style={{
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800" }}>
                Dé {index + 1}
              </Text>

              <Text style={{ opacity: 0.72 }}>
                {die.qty}d{die.sides ?? "?"}
                {die.modifier !== 0
                  ? ` ${die.modifier > 0 ? "+" : ""}${die.modifier}`
                  : ""}
                {die.sign === -1 ? " en négatif" : ""}
              </Text>
            </View>

            {safeDice.length > 1 ? (
              <Pressable
                onPress={() => onRemoveDie(index)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                }}
              >
                <Text>Supprimer</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Dés standards</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {STANDARD_DICE.map((sides) => {
                const selected = die.sides === sides;

                return (
                  <Pressable
                    key={`${index}-${sides}`}
                    onPress={() => updateDie(index, "sides", sides)}
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
              onChangeText={(value) =>
                updateDie(index, "sides", toNumberOrNull(value))
              }
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
              onChangeText={(value) =>
                updateDie(index, "qty", toNumberOrFallback(value, 1))
              }
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
                updateDie(index, "modifier", toNumberOrFallback(value, 0))
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
                onPress={() => updateDie(index, "sign", 1)}
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
                onPress={() => updateDie(index, "sign", -1)}
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
      ))}

      <Pressable
        onPress={onAddDie}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>+ Ajouter un dé</Text>
      </Pressable>
    </View>
  );
}
