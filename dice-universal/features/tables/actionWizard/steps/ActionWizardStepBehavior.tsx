// dice-universal\features\tables\actionWizard\steps\ActionWizardStepBehavior.tsx

import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { ActionWizardDraft } from "../types";

import {
  getRuleBehaviorDefinition,
  getRuleBehaviorVerticalSlice,
  getRuleBehaviorVerticalSliceLabel,
} from "../../../../core/rules/behaviorRegistry";

import { useArcaneTheme } from "../../../../theme/ArcaneThemeProvider";

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

function FieldLabel({ children }: { children: ReactNode }) {
  const { theme } = useArcaneTheme();
  return (
    <Text
      style={{
        color: theme.colors.textMuted,
        fontWeight: "800",
      }}
    >
      {children}
    </Text>
  );
}

function BoxInput(props: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  const { theme } = useArcaneTheme();
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={theme.colors.textSubtle}
      keyboardType={props.keyboardType ?? "default"}
      selectionColor={theme.colors.accent}
      style={{
        minHeight: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
      }}
    />
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            lineHeight: 19,
          }}
        >
          {description}
        </Text>
      ) : null}

      {children}
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : selected ? 1 : 0.78,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InputGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { theme } = useArcaneTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </View>
  );
}

function formatScopeLabel(scope: "entry" | "group" | "both") {
  if (scope === "entry") return "Entrée";
  if (scope === "group") return "Groupe";
  return "Entrée ou groupe";
}

function formatSupportedSidesLabel(supportedSides: number[] | null) {
  if (!supportedSides || supportedSides.length === 0) {
    return "Tous les dés";
  }

  return supportedSides.map((side) => `d${side}`).join(", ");
}

function BehaviorCatalogContext({ draft }: { draft: ActionWizardDraft }) {
  const { theme, styles } = useArcaneTheme();

  if (!draft.behaviorType) {
    return null;
  }

  const behavior = getRuleBehaviorDefinition(draft.behaviorType);

  if (!behavior) {
    return null;
  }

  const slice = getRuleBehaviorVerticalSlice(behavior.key);
  const sliceLabel = getRuleBehaviorVerticalSliceLabel(slice);

  const displayedLabel =
    draft.behaviorType === "custom_pipeline" &&
    draft.behaviorVariant === "keep_drop"
      ? "Garder / retirer des dés"
      : behavior.label;

  const displayedDescription =
    draft.behaviorType === "custom_pipeline" &&
    draft.behaviorVariant === "keep_drop"
      ? "Garde ou retire les meilleurs ou les plus faibles dés, puis calcule le résultat."
      : behavior.description;

  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.sm,
        borderColor: "rgba(145, 113, 255, 0.22)",
        backgroundColor: "rgba(32, 41, 88, 0.42)",
      }}
    >
      <Text
        style={{
          color: theme.colors.textSubtle,
          fontSize: theme.typography.tiny,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {sliceLabel}
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {displayedLabel}
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {displayedDescription}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 7,
        }}
      >
        <View
          style={{
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.22)",
            backgroundColor: "rgba(13, 19, 43, 0.38)",
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            Portée : {formatScopeLabel(behavior.defaultScope)}
          </Text>
        </View>

        <View
          style={{
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: "rgba(145, 113, 255, 0.22)",
            backgroundColor: "rgba(13, 19, 43, 0.38)",
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            Dés : {formatSupportedSidesLabel(behavior.supportedSides)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ActionWizardStepBehavior({
  draft,
  onUpdateDraft,
  onUpdateRangeRow,
  onAddRangeRow,
  onRemoveRangeRow,
}: Props) {
  const { theme, styles } = useArcaneTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={styles.sectionTitle}>Comportement de l’action</Text>

        <Text style={styles.muted}>
          Configure la manière d’interpréter le résultat du jet.
        </Text>
      </View>

      <BehaviorCatalogContext draft={draft} />

      {(draft.behaviorType === "single_check" ||
        draft.behaviorType === "highest_of_pool" ||
        draft.behaviorType === "lowest_of_pool") && (
        <SectionCard
          title="Test contre un seuil"
          description="Définis comment le résultat doit être comparé à une difficulté, avec des faces critiques optionnelles."
        >
          <InputGroup label="Comparaison">
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <ChoiceButton
                label="Seuil haut (≥)"
                selected={draft.compare === "gte"}
                onPress={() => onUpdateDraft("compare", "gte")}
              />

              <ChoiceButton
                label="Seuil bas (≤)"
                selected={draft.compare === "lte"}
                onPress={() => onUpdateDraft("compare", "lte")}
              />
            </View>
          </InputGroup>

          <InputGroup label="Seuil de réussite">
            <BoxInput
              value={draft.successThreshold}
              onChangeText={(value) => onUpdateDraft("successThreshold", value)}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Faces de réussite critique">
            <BoxInput
              value={draft.critSuccessFaces}
              onChangeText={(value) => onUpdateDraft("critSuccessFaces", value)}
              placeholder="Ex: 20"
            />
          </InputGroup>

          <InputGroup label="Faces d’échec critique">
            <BoxInput
              value={draft.critFailureFaces}
              onChangeText={(value) => onUpdateDraft("critFailureFaces", value)}
              placeholder="Ex: 1"
            />
          </InputGroup>
        </SectionCard>
      )}

      {draft.behaviorType === "threshold_degrees" && (
        <SectionCard
          title="Seuil avec degrés"
          description="Configure une résolution avec valeur cible, degrés de réussite ou d’échec, et bornes critiques."
        >
          <InputGroup label="Comparaison">
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <ChoiceButton
                label="Réussir en dessous (≤)"
                selected={draft.compare === "lte"}
                onPress={() => onUpdateDraft("compare", "lte")}
              />

              <ChoiceButton
                label="Réussir au-dessus (≥)"
                selected={draft.compare === "gte"}
                onPress={() => onUpdateDraft("compare", "gte")}
              />
            </View>
          </InputGroup>

          <InputGroup label="Seuil / valeur cible">
            <BoxInput
              value={draft.targetValue}
              onChangeText={(value) => onUpdateDraft("targetValue", value)}
              placeholder="Ex: 65"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Taille d’un degré">
            <BoxInput
              value={draft.degreeStep}
              onChangeText={(value) => onUpdateDraft("degreeStep", value)}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Réussite critique — minimum">
            <BoxInput
              value={draft.critSuccessMin}
              onChangeText={(value) => onUpdateDraft("critSuccessMin", value)}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Réussite critique — maximum">
            <BoxInput
              value={draft.critSuccessMax}
              onChangeText={(value) => onUpdateDraft("critSuccessMax", value)}
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Échec critique — minimum">
            <BoxInput
              value={draft.critFailureMin}
              onChangeText={(value) => onUpdateDraft("critFailureMin", value)}
              placeholder="Ex: 95"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Échec critique — maximum">
            <BoxInput
              value={draft.critFailureMax}
              onChangeText={(value) => onUpdateDraft("critFailureMax", value)}
              placeholder="Ex: 100"
              keyboardType="numeric"
            />
          </InputGroup>
        </SectionCard>
      )}

      {draft.behaviorType === "custom_pipeline" &&
        draft.behaviorVariant === "keep_drop" && (
          <SectionCard
            title="Garder / retirer des dés"
            description="Choisis une seule logique principale : garder ou retirer les meilleurs ou les plus faibles dés, puis décide du format du résultat final."
          >
            <InputGroup label="Garder les meilleurs dés">
              <BoxInput
                value={draft.pipelineKeepHighest}
                onChangeText={(value) => {
                  onUpdateDraft("pipelineKeepHighest", value);
                  if (value.trim()) {
                    onUpdateDraft("pipelineKeepLowest", "");
                    onUpdateDraft("pipelineDropHighest", "");
                    onUpdateDraft("pipelineDropLowest", "");
                  }
                }}
                placeholder="Ex: 2"
                keyboardType="numeric"
              />
            </InputGroup>

            <InputGroup label="Garder les plus faibles dés">
              <BoxInput
                value={draft.pipelineKeepLowest}
                onChangeText={(value) => {
                  onUpdateDraft("pipelineKeepLowest", value);
                  if (value.trim()) {
                    onUpdateDraft("pipelineKeepHighest", "");
                    onUpdateDraft("pipelineDropHighest", "");
                    onUpdateDraft("pipelineDropLowest", "");
                  }
                }}
                placeholder="Ex: 2"
                keyboardType="numeric"
              />
            </InputGroup>

            <InputGroup label="Retirer les meilleurs dés">
              <BoxInput
                value={draft.pipelineDropHighest}
                onChangeText={(value) => {
                  onUpdateDraft("pipelineDropHighest", value);
                  if (value.trim()) {
                    onUpdateDraft("pipelineKeepHighest", "");
                    onUpdateDraft("pipelineKeepLowest", "");
                    onUpdateDraft("pipelineDropLowest", "");
                  }
                }}
                placeholder="Ex: 1"
                keyboardType="numeric"
              />
            </InputGroup>

            <InputGroup label="Retirer les plus faibles dés">
              <BoxInput
                value={draft.pipelineDropLowest}
                onChangeText={(value) => {
                  onUpdateDraft("pipelineDropLowest", value);
                  if (value.trim()) {
                    onUpdateDraft("pipelineKeepHighest", "");
                    onUpdateDraft("pipelineKeepLowest", "");
                    onUpdateDraft("pipelineDropHighest", "");
                  }
                }}
                placeholder="Ex: 1"
                keyboardType="numeric"
              />
            </InputGroup>

            <InputGroup label="Résultat final">
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <ChoiceButton
                  label="Somme"
                  selected={draft.pipelineOutput === "sum"}
                  onPress={() => onUpdateDraft("pipelineOutput", "sum")}
                />

                <ChoiceButton
                  label="Valeurs"
                  selected={draft.pipelineOutput === "values"}
                  onPress={() => onUpdateDraft("pipelineOutput", "values")}
                />
              </View>
            </InputGroup>
          </SectionCard>
        )}

      {draft.behaviorType === "custom_pipeline" &&
        draft.behaviorVariant === "default" && (
          <>
            <SectionCard
              title="Pipeline personnalisé"
              description="Combine plusieurs opérations pour créer une règle avancée : relances, explosions, dés gardés, comptage, seuils et critiques."
            />

            <SectionCard title="Relances">
              <InputGroup label="Relancer les faces">
                <BoxInput
                  value={draft.pipelineRerollFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineRerollFaces", value)
                  }
                  placeholder="Ex: 1 ou 1,2"
                />
              </InputGroup>

              <InputGroup label="Mode de relance">
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  <ChoiceButton
                    label="Une seule fois"
                    selected={draft.pipelineRerollOnce}
                    onPress={() => onUpdateDraft("pipelineRerollOnce", true)}
                  />

                  <ChoiceButton
                    label="Tant que possible"
                    selected={!draft.pipelineRerollOnce}
                    onPress={() => onUpdateDraft("pipelineRerollOnce", false)}
                  />
                </View>
              </InputGroup>

              <InputGroup label="Nombre max de relances par dé">
                <BoxInput
                  value={draft.pipelineMaxRerollsPerDie}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineMaxRerollsPerDie", value)
                  }
                  placeholder="Optionnel, ex: 2"
                  keyboardType="numeric"
                />

                <Text style={styles.muted}>
                  Laisse vide pour ne pas fixer de limite précise. La limite
                  s’applique à chaque dé individuellement.
                </Text>
              </InputGroup>
            </SectionCard>

            <SectionCard
              title="Explosions"
              description="Ajoute des dés supplémentaires lorsqu’une face ciblée ressort. Utile pour les systèmes explosifs ou les jets héroïques."
            >
              <InputGroup label="Explosion sur les faces">
                <BoxInput
                  value={draft.pipelineExplodeFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineExplodeFaces", value)
                  }
                  placeholder="Ex: 6 ou 10"
                />
              </InputGroup>

              <InputGroup label="Nombre max d’explosions par dé">
                <BoxInput
                  value={draft.pipelineMaxExplosionsPerDie}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineMaxExplosionsPerDie", value)
                  }
                  placeholder="Optionnel, ex: 3"
                  keyboardType="numeric"
                />

                <Text style={styles.muted}>
                  Laisse vide pour permettre les explosions tant que la face
                  ciblée ressort. La limite s’applique à chaque dé
                  individuellement.
                </Text>
              </InputGroup>
            </SectionCard>

            <SectionCard
              title="Garder / retirer"
              description="Contrôle quels dés sont conservés ou exclus avant de calculer le résultat final."
            >
              <InputGroup label="Garder les meilleurs dés">
                <BoxInput
                  value={draft.pipelineKeepHighest}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineKeepHighest", value)
                  }
                  placeholder="Ex: 2"
                  keyboardType="numeric"
                />
              </InputGroup>

              <InputGroup label="Garder les plus faibles dés">
                <BoxInput
                  value={draft.pipelineKeepLowest}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineKeepLowest", value)
                  }
                  placeholder="Ex: 2"
                  keyboardType="numeric"
                />
              </InputGroup>

              <InputGroup label="Retirer les meilleurs dés">
                <BoxInput
                  value={draft.pipelineDropHighest}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineDropHighest", value)
                  }
                  placeholder="Ex: 1"
                  keyboardType="numeric"
                />
              </InputGroup>

              <InputGroup label="Retirer les plus faibles dés">
                <BoxInput
                  value={draft.pipelineDropLowest}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineDropLowest", value)
                  }
                  placeholder="Ex: 1"
                  keyboardType="numeric"
                />
              </InputGroup>
            </SectionCard>

            <SectionCard
              title="Comptage"
              description="Transforme le jet en nombre de succès, de faces exactes ou de résultats dans une plage."
            >
              <InputGroup label="Compter les succès à partir de">
                <BoxInput
                  value={draft.pipelineCountSuccessAtOrAbove}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineCountSuccessAtOrAbove", value)
                  }
                  placeholder="Ex: 5"
                  keyboardType="numeric"
                />
              </InputGroup>

              <InputGroup label="Compter les faces exactes">
                <BoxInput
                  value={draft.pipelineCountEqualFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineCountEqualFaces", value)
                  }
                  placeholder="Ex: 1 ou 6,10"
                />
              </InputGroup>

              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <InputGroup label="Plage min">
                    <BoxInput
                      value={draft.pipelineCountRangeMin}
                      onChangeText={(value) =>
                        onUpdateDraft("pipelineCountRangeMin", value)
                      }
                      placeholder="Ex: 1"
                      keyboardType="numeric"
                    />
                  </InputGroup>
                </View>

                <View style={{ flex: 1 }}>
                  <InputGroup label="Plage max">
                    <BoxInput
                      value={draft.pipelineCountRangeMax}
                      onChangeText={(value) =>
                        onUpdateDraft("pipelineCountRangeMax", value)
                      }
                      placeholder="Ex: 3"
                      keyboardType="numeric"
                    />
                  </InputGroup>
                </View>
              </View>
            </SectionCard>

            <SectionCard
              title="Sortie finale"
              description="Choisis ce que l’action doit renvoyer après toutes les opérations du pipeline."
            >
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "sum", label: "Somme" },
                  { key: "values", label: "Valeurs" },
                  { key: "successes", label: "Succès" },
                  { key: "count_equal", label: "Faces exactes" },
                  { key: "count_range", label: "Plage" },
                  { key: "first_value", label: "Première valeur" },
                ].map((option) => (
                  <ChoiceButton
                    key={option.key}
                    label={option.label}
                    selected={draft.pipelineOutput === option.key}
                    onPress={() =>
                      onUpdateDraft(
                        "pipelineOutput",
                        option.key as ActionWizardDraft["pipelineOutput"],
                      )
                    }
                  />
                ))}
              </View>
            </SectionCard>

            <SectionCard
              title="Seuil final"
              description="Optionnel : compare la sortie finale à une difficulté pour afficher une réussite ou un échec."
            >
              <InputGroup label="Comparer la sortie finale à un seuil">
                <BoxInput
                  value={draft.pipelineSuccessThreshold}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineSuccessThreshold", value)
                  }
                  placeholder="Optionnel, ex: 10"
                  keyboardType="numeric"
                />
              </InputGroup>

              <InputGroup label="Comparaison">
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  <ChoiceButton
                    label="≥ seuil"
                    selected={draft.pipelineCompare === "gte"}
                    onPress={() => onUpdateDraft("pipelineCompare", "gte")}
                  />

                  <ChoiceButton
                    label="≤ seuil"
                    selected={draft.pipelineCompare === "lte"}
                    onPress={() => onUpdateDraft("pipelineCompare", "lte")}
                  />
                </View>
              </InputGroup>
            </SectionCard>

            <SectionCard
              title="Critiques et complications"
              description="Optionnel : ajoute des résultats spéciaux pour signaler les réussites critiques, échecs critiques ou complications."
            >
              <InputGroup label="Faces de réussite critique">
                <BoxInput
                  value={draft.pipelineCritSuccessFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineCritSuccessFaces", value)
                  }
                  placeholder="Optionnel, ex: 6"
                />
              </InputGroup>

              <InputGroup label="Faces d’échec critique">
                <BoxInput
                  value={draft.pipelineCritFailureFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineCritFailureFaces", value)
                  }
                  placeholder="Optionnel, ex: 1"
                />
              </InputGroup>

              <InputGroup label="Faces de complication">
                <BoxInput
                  value={draft.pipelineComplicationFaces}
                  onChangeText={(value) =>
                    onUpdateDraft("pipelineComplicationFaces", value)
                  }
                  placeholder="Optionnel, ex: 1 ou 1,2"
                />
              </InputGroup>

              <InputGroup label="Règle de complication">
                <View style={{ gap: theme.spacing.sm }}>
                  {[
                    {
                      key: "none",
                      label: "Aucune complication",
                    },
                    {
                      key: "any",
                      label: "Si au moins une face ciblée apparaît",
                    },
                    {
                      key: "gt_successes",
                      label: "Si complications > succès",
                    },
                    {
                      key: "gte_successes",
                      label: "Si complications ≥ succès",
                    },
                    {
                      key: "zero_successes",
                      label: "Si aucune réussite",
                    },
                  ].map((option) => (
                    <ChoiceButton
                      key={option.key}
                      label={option.label}
                      selected={draft.pipelineComplicationRule === option.key}
                      onPress={() =>
                        onUpdateDraft(
                          "pipelineComplicationRule",
                          option.key as ActionWizardDraft["pipelineComplicationRule"],
                        )
                      }
                    />
                  ))}
                </View>
              </InputGroup>
            </SectionCard>
          </>
        )}

      {draft.behaviorType === "success_pool" && (
        <SectionCard
          title="Pool de succès"
          description="Compte les réussites dans un groupe de dés et ajoute éventuellement une logique de complication."
        >
          <InputGroup label="Réussite à partir de">
            <BoxInput
              value={draft.successAtOrAbove}
              onChangeText={(value) => onUpdateDraft("successAtOrAbove", value)}
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Faces d’échec spécial">
            <BoxInput
              value={draft.failFaces}
              onChangeText={(value) => onUpdateDraft("failFaces", value)}
              placeholder="Ex: 1"
            />
          </InputGroup>

          <InputGroup label="Règle de complication">
            <View style={{ gap: theme.spacing.sm }}>
              {[
                {
                  key: "ones_gt_successes",
                  label: "Si échecs spéciaux > réussites",
                },
                {
                  key: "ones_gte_successes",
                  label: "Si échecs spéciaux ≥ réussites",
                },
                {
                  key: "none",
                  label: "Aucune complication",
                },
              ].map((option) => (
                <ChoiceButton
                  key={option.key}
                  label={option.label}
                  selected={draft.glitchRule === option.key}
                  onPress={() =>
                    onUpdateDraft(
                      "glitchRule",
                      option.key as ActionWizardDraft["glitchRule"],
                    )
                  }
                />
              ))}
            </View>
          </InputGroup>
        </SectionCard>
      )}

      {draft.behaviorType === "sum_total" && (
        <SectionCard
          title="Somme simple"
          description="Tous les dés lancés sont additionnés avec leurs modificateurs pour produire un total clair."
        />
      )}

      {(draft.behaviorType === "keep_highest_n" ||
        draft.behaviorType === "keep_lowest_n") && (
        <SectionCard
          title={
            draft.behaviorType === "keep_highest_n"
              ? "Garder les meilleurs dés"
              : "Garder les plus faibles dés"
          }
          description="Choisis combien de dés conserver avant de produire le résultat final."
        >
          <InputGroup
            label={
              draft.behaviorType === "keep_highest_n"
                ? "Nombre de meilleurs dés à garder"
                : "Nombre de plus faibles dés à garder"
            }
          >
            <BoxInput
              value={draft.keepCount}
              onChangeText={(value) => onUpdateDraft("keepCount", value)}
              placeholder="Ex: 3"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Mode de résultat">
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <ChoiceButton
                label="Somme des dés gardés"
                selected={draft.resultMode === "sum"}
                onPress={() => onUpdateDraft("resultMode", "sum")}
              />

              <ChoiceButton
                label="Liste des dés gardés"
                selected={draft.resultMode === "values"}
                onPress={() => onUpdateDraft("resultMode", "values")}
              />
            </View>
          </InputGroup>
        </SectionCard>
      )}

      {(draft.behaviorType === "drop_highest_n" ||
        draft.behaviorType === "drop_lowest_n") && (
        <SectionCard
          title={
            draft.behaviorType === "drop_highest_n"
              ? "Retirer les meilleurs dés"
              : "Retirer les plus faibles dés"
          }
          description="Choisis combien de dés exclure avant de produire le résultat final."
        >
          <InputGroup
            label={
              draft.behaviorType === "drop_highest_n"
                ? "Nombre de meilleurs dés à retirer"
                : "Nombre de plus faibles dés à retirer"
            }
          >
            <BoxInput
              value={draft.dropCount}
              onChangeText={(value) => onUpdateDraft("dropCount", value)}
              placeholder="Ex: 1"
              keyboardType="numeric"
            />
          </InputGroup>

          <InputGroup label="Mode de résultat">
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <ChoiceButton
                label="Somme restante"
                selected={draft.resultMode === "sum"}
                onPress={() => onUpdateDraft("resultMode", "sum")}
              />

              <ChoiceButton
                label="Liste restante"
                selected={draft.resultMode === "values"}
                onPress={() => onUpdateDraft("resultMode", "values")}
              />
            </View>
          </InputGroup>
        </SectionCard>
      )}

      {(draft.behaviorType === "banded_sum" ||
        draft.behaviorType === "table_lookup") && (
        <SectionCard
          title={
            draft.behaviorType === "banded_sum" ? "Paliers" : "Intervalles"
          }
          description={
            draft.behaviorType === "banded_sum"
              ? "Définis des plages de total et le libellé associé à chaque palier."
              : "Définis des plages de résultat pour transformer une valeur en libellé."
          }
        >
          {draft.ranges.map((row, index) => (
            <View
              key={index}
              style={{
                ...styles.cardSoft,
                gap: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                }}
              >
                Ligne {index + 1}
              </Text>

              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <InputGroup label="Min">
                    <BoxInput
                      value={row.min}
                      onChangeText={(value) =>
                        onUpdateRangeRow(index, "min", value)
                      }
                      placeholder="Min"
                      keyboardType="numeric"
                    />
                  </InputGroup>
                </View>

                <View style={{ flex: 1 }}>
                  <InputGroup label="Max">
                    <BoxInput
                      value={row.max}
                      onChangeText={(value) =>
                        onUpdateRangeRow(index, "max", value)
                      }
                      placeholder="Max"
                      keyboardType="numeric"
                    />
                  </InputGroup>
                </View>
              </View>

              <InputGroup label="Libellé">
                <BoxInput
                  value={row.label}
                  onChangeText={(value) =>
                    onUpdateRangeRow(index, "label", value)
                  }
                  placeholder="Ex: Réussite partielle"
                />
              </InputGroup>

              <Pressable
                onPress={() => onRemoveRangeRow(index)}
                style={({ pressed }) => ({
                  alignSelf: "flex-start",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.failure,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.failureSoft,
                  opacity: pressed ? 0.84 : 1,
                })}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                  }}
                >
                  Supprimer cette ligne
                </Text>
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={onAddRangeRow}
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: theme.colors.accent,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.accentSoft,
              opacity: pressed ? 0.84 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
              }}
            >
              Ajouter une ligne
            </Text>
          </Pressable>
        </SectionCard>
      )}
    </View>
  );
}
