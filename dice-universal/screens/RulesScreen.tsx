import { View, Text, Pressable } from "react-native";
import { useDb } from "../data/db/DbProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useHumanRuleEditor } from "../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../features/rules/components/HumanRuleEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

import { CreateRuleWizardModal } from "../features/rules/ruleWizard/CreateRuleWizardModal";
import { useRuleWizard } from "../features/rules/ruleWizard/useRuleWizard";
import { useRuleWizardPreview } from "../features/rules/ruleWizard/useRuleWizardPreview";

import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";
import { usePremiumTheme } from "../theme/premium/usePremiumTheme";

function HeaderPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.24)",
        backgroundColor: "rgba(232, 200, 120, 0.08)",
        paddingHorizontal: 11,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          color: premium.colors.accent.primary,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ConceptChip({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: 96,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.075)",
        backgroundColor: "rgba(255,255,255,0.04)",
        paddingHorizontal: 11,
        paddingVertical: 10,
        gap: 4,
      }}
    >
      <Text
        style={{
          color: premium.colors.text.primary,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 10,
          fontWeight: "700",
          lineHeight: 14,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function HeroCard({
  systemCount,
  customCount,
}: {
  systemCount: number;
  customCount: number;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.16)",
        backgroundColor: "rgba(8, 11, 24, 0.78)",
        paddingHorizontal: 18,
        paddingVertical: 18,
        gap: 14,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          right: -70,
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: "rgba(232, 200, 120, 0.08)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -90,
          left: -90,
          width: 190,
          height: 190,
          borderRadius: 999,
          backgroundColor: "rgba(124, 92, 255, 0.08)",
        }}
      />

      <View style={{ gap: 9 }}>
        <HeaderPill label="Atelier des comportements" />

        <Text
          style={{
            color: premium.colors.text.primary,
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: -0.7,
            lineHeight: 34,
          }}
        >
          Comportements
        </Text>

        <Text
          style={{
            color: premium.colors.text.secondary,
            fontSize: 14,
            fontWeight: "700",
            lineHeight: 20,
          }}
        >
          Un comportement explique comment lire un jet : addition simple, test
          avec seuil, pool de succès, paliers, ou règles avancées. Tu les crées
          ici, puis tu les appliques à tes actions et à tes dés.
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <ConceptChip
          title="Entrée"
          description="Une ligne de dés précise, comme 2d6 + 3."
        />

        <ConceptChip
          title="Groupe"
          description="Un jet complet composé de plusieurs entrées."
        />

        <ConceptChip
          title="Résultat"
          description="La lecture finale affichée après le lancer."
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <StatusPill label={`${systemCount} système`} />
        <StatusPill label={`${customCount} perso`} />
        <StatusPill label="Réutilisables" />
      </View>
    </View>
  );
}

function StatusPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.085)",
        backgroundColor: "rgba(255,255,255,0.045)",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ActionButton({
  title,
  description,
  badge,
  onPress,
  variant = "default",
}: {
  title: string;
  description: string;
  badge: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const premium = usePremiumTheme();

  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 155,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 116,
          borderRadius: 26,
          borderWidth: 1,
          borderColor: isAccent
            ? "rgba(232, 200, 120, 0.28)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: isAccent
            ? "rgba(232, 200, 120, 0.105)"
            : "rgba(255,255,255,0.045)",
          paddingHorizontal: 15,
          paddingVertical: 14,
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ gap: 7 }}>
          <Text
            style={{
              color: isAccent
                ? premium.colors.accent.primary
                : premium.colors.text.primary,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: premium.colors.text.muted,
              fontSize: 12,
              fontWeight: "700",
              lineHeight: 17,
            }}
          >
            {description}
          </Text>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: premium.radius.pill,
            borderWidth: 1,
            borderColor: isAccent
              ? "rgba(232, 200, 120, 0.26)"
              : "rgba(255,255,255,0.08)",
            backgroundColor: isAccent
              ? "rgba(232, 200, 120, 0.09)"
              : "rgba(255,255,255,0.045)",
            paddingHorizontal: 9,
            paddingVertical: 5,
          }}
        >
          <Text
            style={{
              color: isAccent
                ? premium.colors.accent.primary
                : premium.colors.text.secondary,
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            {badge}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const premium = usePremiumTheme();

  return (
    <View style={{ gap: 5 }}>
      <Text
        style={{
          color: premium.colors.text.primary,
          fontSize: 17,
          fontWeight: "900",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: premium.colors.text.muted,
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 17,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function ErrorState({ error }: { error: string }) {
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: layout.insets.top + theme.spacing.lg,
          paddingHorizontal: layout.horizontalPadding,
          justifyContent: "center",
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Erreur</Text>

        <Text
          style={[
            styles.muted,
            {
              marginTop: theme.spacing.sm,
            },
          ]}
        >
          {error}
        </Text>
      </View>
    </View>
  );
}

export default function RulesScreen() {
  const db = useDb();
  const layout = useArcaneLayout();
  const { theme, styles } = useArcaneTheme();
  const premium = usePremiumTheme();

  const { notifyDataChanged } = useDataRefresh();

  const { error, systemRules, customRules, saveRule, removeRule } =
    useRulesData({ db });

  const {
    showEditModal,
    editingRule,
    form,
    previewValues,
    previewSides,
    previewModifier,
    previewSign,
    previewResult,
    formError,
    setPreviewValues,
    setPreviewSides,
    setPreviewModifier,
    setPreviewSign,
    openCreate,
    openEdit,
    closeEditor,
    updateForm,
    updateRangeRow,
    addRangeRow,
    removeRangeRow,
    getRulePayload,
    computePreview,
    setScope,
    setSupportedSidesText,
  } = useHumanRuleEditor();

  const { handleSave, handleDeleteRule } = useRulesScreenActions({
    editingRule,
    getRulePayload,
    saveRule,
    removeRule,
    closeEditor,
    notifyDataChanged,
  });

  const ruleWizard = useRuleWizard();

  const ruleWizardPreview = useRuleWizardPreview({
    buildPayload: ruleWizard.buildPayload,
    deps: [ruleWizard.draft],
  });

  async function handleCreateFromWizard() {
    try {
      const payload = ruleWizard.buildPayload();

      await saveRule({
        editingRule: null,
        payload: {
          ...payload,
          supported_sides_json: payload.supported_sides_json ?? "[]",
        },
      });

      ruleWizard.close();
      notifyDataChanged();
    } catch (err) {
      console.error(err);
    }
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <View
      style={{
        ...styles.screen,
        backgroundColor: "transparent",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -140,
          right: -120,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: "rgba(232, 200, 120, 0.055)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -180,
          left: -150,
          width: 340,
          height: 340,
          borderRadius: 999,
          backgroundColor: "rgba(124, 92, 255, 0.055)",
        }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + theme.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + theme.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: theme.spacing.md,
        }}
      >
        <HeroCard
          systemCount={systemRules.length}
          customCount={customRules.length}
        />

        <View style={{ gap: 10 }}>
          <SectionHeader
            title="Créer un comportement"
            description="Utilise la création guidée pour les cas classiques. Le mode expert reste disponible pour les règles très spécifiques."
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
            }}
          >
            <ActionButton
              title="Création guidée"
              description="Choisir une famille, régler quelques valeurs, tester un exemple, puis sauvegarder."
              badge="Recommandé"
              onPress={ruleWizard.open}
              variant="accent"
            />

            <ActionButton
              title="Mode expert"
              description="Accéder à tous les paramètres techniques d’une règle personnalisée."
              badge="Avancé"
              onPress={openCreate}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.075)",
            backgroundColor: "rgba(5, 7, 19, 0.46)",
            padding: 10,
            gap: 10,
            overflow: "hidden",
          }}
        >
          <SectionHeader
            title="Bibliothèque"
            description="Comportements système et comportements personnalisés disponibles pour tes tables, profils et actions."
          />

          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />

          <RulesListSection
            systemRules={systemRules}
            customRules={customRules}
            onEditRule={openEdit}
            onDeleteRule={handleDeleteRule}
          />
        </View>

        <HumanRuleEditorModal
          visible={showEditModal}
          editingRule={editingRule}
          form={form}
          formError={formError}
          previewValues={previewValues}
          previewSides={previewSides}
          previewModifier={previewModifier}
          previewSign={previewSign}
          previewResult={previewResult}
          onChangePreviewValues={setPreviewValues}
          onChangePreviewSides={setPreviewSides}
          onChangePreviewModifier={setPreviewModifier}
          onChangePreviewSign={setPreviewSign}
          onUpdateForm={updateForm}
          onUpdateRangeRow={updateRangeRow}
          onAddRangeRow={addRangeRow}
          onRemoveRangeRow={removeRangeRow}
          onComputePreview={computePreview}
          onClose={closeEditor}
          onSave={handleSave}
          onSetScope={setScope}
          onSetSupportedSidesText={setSupportedSidesText}
        />

        <CreateRuleWizardModal
          visible={ruleWizard.visible}
          step={ruleWizard.step}
          stepIndex={ruleWizard.stepIndex}
          totalSteps={ruleWizard.totalSteps}
          draft={ruleWizard.draft}
          error={ruleWizard.error}
          onClose={ruleWizard.close}
          onBack={ruleWizard.goBack}
          onNext={ruleWizard.goNext}
          onSubmit={handleCreateFromWizard}
          onUpdateDraft={ruleWizard.updateDraft}
          onSetScope={ruleWizard.setScope}
          onSetBehaviorKey={ruleWizard.setBehaviorKey}
          onUpdateRangeRow={ruleWizard.updateRangeRow}
          onAddRangeRow={ruleWizard.addRangeRow}
          onRemoveRangeRow={ruleWizard.removeRangeRow}
          previewValuesText={ruleWizardPreview.valuesText}
          previewSidesText={ruleWizardPreview.sidesText}
          previewModifierText={ruleWizardPreview.modifierText}
          previewSignText={ruleWizardPreview.signText}
          previewResult={ruleWizardPreview.previewResult}
          onChangePreviewValuesText={ruleWizardPreview.setValuesText}
          onChangePreviewSidesText={ruleWizardPreview.setSidesText}
          onChangePreviewModifierText={ruleWizardPreview.setModifierText}
          onChangePreviewSignText={ruleWizardPreview.setSignText}
        />
      </View>
    </View>
  );
}
