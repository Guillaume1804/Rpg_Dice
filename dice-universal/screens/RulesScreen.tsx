// dice-universal\screens\RulesScreen.tsx

import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useDb } from "../data/db/DbProvider";

import { useDataRefresh } from "../data/state/DataRefreshProvider";

import { useRulesData } from "../features/rules/hooks/useRulesData";
import { useHumanRuleEditor } from "../features/rules/hooks/useHumanRuleEditor";
import { HumanRuleEditorModal } from "../features/rules/components/HumanRuleEditorModal";
import { RulesListSection } from "../features/rules/components/RulesListSection";
import { useRulesScreenActions } from "../features/rules/hooks/useRulesScreenActions";

import { CreateGuidedBehaviorWizardModal } from "../features/rules/guidedBehavior/CreateGuidedBehaviorWizardModal";
import { useGuidedBehaviorWizard } from "../features/rules/guidedBehavior/useGuidedBehaviorWizard";
import { GuidedBehaviorPreviewModal } from "../features/rules/guidedBehavior/GuidedBehaviorPreviewModal";
import { useGuidedBehaviorPreview } from "../features/rules/guidedBehavior/useGuidedBehaviorPreview";

import type { OfficialBehaviorCatalogItem } from "../features/rules/components/RulesListSection";

import { useArcaneLayout } from "../theme/useArcaneLayout";
import { usePremiumTheme } from "../theme/premium/usePremiumTheme";

import { isRuleEditableWithGuidedBuilder } from "../features/rules/guidedBehavior/guidedBehaviorRuleAdapter";

function ScreenGlow({
  position,
}: {
  position: "topRight" | "bottomLeft" | "center";
}) {
  const styleByPosition =
    position === "topRight"
      ? {
        top: -150,
        right: -130,
        width: 300,
        height: 300,
        backgroundColor: "rgba(232, 200, 120, 0.075)",
      }
      : position === "bottomLeft"
        ? {
          bottom: -190,
          left: -160,
          width: 360,
          height: 360,
          backgroundColor: "rgba(124, 92, 255, 0.07)",
        }
        : {
          top: "36%" as const,
          left: -120,
          width: 240,
          height: 240,
          backgroundColor: "rgba(255,255,255,0.025)",
        };

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        borderRadius: 999,
        ...styleByPosition,
      }}
    />
  );
}

function HeaderPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.28)",
        backgroundColor: "rgba(232, 200, 120, 0.09)",
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

function InfoButton({ onPress }: { onPress: () => void }) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: "rgba(232, 200, 120, 0.24)",
          backgroundColor: "rgba(232, 200, 120, 0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: premium.colors.accent.primary,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          i
        </Text>
      </View>
    </Pressable>
  );
}

function WorkshopHeader({
  systemCount,
  customCount,
  onOpenInfo,
}: {
  systemCount: number;
  customCount: number;
  onOpenInfo: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 26,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.16)",
        backgroundColor: "rgba(8, 11, 24, 0.88)",
        paddingHorizontal: 15,
        paddingVertical: 14,
        gap: 10,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -70,
          right: -72,
          width: 160,
          height: 160,
          borderRadius: 999,
          backgroundColor: "rgba(232, 200, 120, 0.09)",
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <HeaderPill label="Atelier de comportements" />

          <Text
            numberOfLines={1}
            style={{
              color: "rgba(255,255,255,0.98)",
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: -0.55,
            }}
          >
            Comportements
          </Text>
        </View>

        <InfoButton onPress={onOpenInfo} />
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <MiniStatusPill label={`${systemCount} système`} />
        <MiniStatusPill label={`${customCount} perso`} />
        <MiniStatusPill label="Réutilisables" />
      </View>
    </View>
  );
}

function MiniStatusPill({ label }: { label: string }) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          color: "rgba(255,255,255,0.62)",
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
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "rgba(255,255,255,0.045)",
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 3,
      }}
    >
      <Text
        style={{
          color: "rgba(255,255,255,0.94)",
          fontSize: 11,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 9,
          fontWeight: "700",
          lineHeight: 13,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function BehaviorInfoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(8, 11, 24, 0.97)",
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 14,
          }}
        >
          <View style={{ gap: 8 }}>
            <HeaderPill label="Information" />

            <Text
              style={{
                color: "rgba(255,255,255,0.96)",
                fontSize: 22,
                fontWeight: "900",
                letterSpacing: -0.3,
              }}
            >
              À quoi sert cet écran ?
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 13,
                fontWeight: "700",
                lineHeight: 19,
              }}
            >
              Un comportement explique comment lire un jet : addition simple,
              test avec seuil, pool de succès, paliers, garder ou retirer des
              dés, ou règles avancées. Tu les crées ici, puis tu les appliques à
              tes actions, entrées de dés et résultats.
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
              description="Une ligne précise, comme 2d6 + 3."
            />

            <ConceptChip
              title="Groupe"
              description="Un jet complet avec plusieurs entrées."
            />

            <ConceptChip
              title="Résultat"
              description="La lecture finale après le lancer."
            />
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.78 : 1,
              transform: [
                { scale: pressed ? premium.animation.pressScale : 1 },
              ],
            })}
          >
            <View
              style={{
                minHeight: 42,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(232, 200, 120, 0.26)",
                backgroundColor: "rgba(232, 200, 120, 0.10)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Compris
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SystemBehaviorDetailsModal({
  item,
  onClose,
}: {
  item: OfficialBehaviorCatalogItem | null;
  onClose: () => void;
}) {
  const premium = usePremiumTheme();

  if (!item) return null;

  const diceLabel =
    item.supportedSides && item.supportedSides.length > 0
      ? item.supportedSides.map((side) => `d${side}`).join(", ")
      : "Tous les dés";

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.70)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.18)",
            backgroundColor: "rgba(8, 11, 24, 0.98)",
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 14,
          }}
        >
          <View style={{ gap: 8 }}>
            <HeaderPill label="Comportement système" />

            <Text
              style={{
                color: "rgba(255,255,255,0.96)",
                fontSize: 23,
                fontWeight: "900",
                letterSpacing: -0.35,
              }}
            >
              {item.icon} {item.label}
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.66)",
                fontSize: 13,
                fontWeight: "700",
                lineHeight: 19,
              }}
            >
              {item.description}
            </Text>
          </View>

          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.045)",
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.75,
              }}
            >
              À quoi ça sert ?
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 18,
              }}
            >
              Ce comportement sert de modèle officiel. Tu peux l’utiliser dans
              tes actions, tes entrées de dés ou comme base d’inspiration pour
              créer un comportement personnalisé.
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <ConceptChip title="Famille" description={item.family} />

            <ConceptChip title="Dés" description={diceLabel} />

            <ConceptChip
              title="Source"
              description={item.sourceRule ? "Modèle disponible" : "Catalogue"}
            />
          </View>

          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.045)",
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.75,
              }}
            >
              Conseil
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 18,
              }}
            >
              Pour créer ta propre variante, utilise “Nouveau comportement”. Le
              builder guidé te proposera les options adaptées selon tes choix :
              seuil, succès, explosions, relances, critiques, complications ou
              paliers.
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.78 : 1,
              transform: [
                { scale: pressed ? premium.animation.pressScale : 1 },
              ],
            })}
          >
            <View
              style={{
                minHeight: 42,
                borderRadius: premium.radius.pill,
                borderWidth: 1,
                borderColor: "rgba(232, 200, 120, 0.26)",
                backgroundColor: "rgba(232, 200, 120, 0.10)",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Fermer
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
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
        minWidth: 150,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 82,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: isAccent
            ? "rgba(232, 200, 120, 0.30)"
            : "rgba(255,255,255,0.09)",
          backgroundColor: isAccent
            ? "rgba(232, 200, 120, 0.115)"
            : "rgba(255,255,255,0.055)",
          paddingHorizontal: 13,
          paddingVertical: 12,
          justifyContent: "space-between",
          gap: 9,
        }}
      >
        <View style={{ gap: 5 }}>
          <Text
            style={{
              color: isAccent
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.92)",
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            {title}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: "rgba(255,255,255,0.64)",
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 16,
            }}
          >
            {description}
          </Text>
        </View>

        <Text
          style={{
            color: isAccent
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.55)",
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          {badge}
        </Text>
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
  return (
    <View style={{ gap: 5 }}>
      <Text
        style={{
          color: "rgba(255,255,255,0.94)",
          fontSize: 17,
          fontWeight: "900",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: "rgba(255,255,255,0.58)",
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
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#050713",
        paddingTop: layout.insets.top + 24,
        paddingHorizontal: layout.horizontalPadding,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          borderRadius: 26,
          borderWidth: 1,
          borderColor: "rgba(239, 111, 145, 0.26)",
          backgroundColor: "rgba(239, 111, 145, 0.08)",
          padding: 16,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: premium.colors.state.failure,
            fontSize: 18,
            fontWeight: "900",
          }}
        >
          Erreur
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.70)",
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 19,
          }}
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
  const premium = usePremiumTheme();

  const [showInfoModal, setShowInfoModal] = useState(false);

  const [selectedSystemBehavior, setSelectedSystemBehavior] =
    useState<OfficialBehaviorCatalogItem | null>(null);

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

  const guidedBehaviorWizard = useGuidedBehaviorWizard();

  const guidedBehaviorPreview = useGuidedBehaviorPreview(
    guidedBehaviorWizard.draft,
  );

  function handleEditRule(rule: Parameters<typeof openEdit>[0]) {
    if (isRuleEditableWithGuidedBuilder(rule)) {
      guidedBehaviorWizard.openFromRule(rule);
      return;
    }

    openEdit(rule);
  }

  async function handleCreateFromWizard() {
    try {
      const payload = guidedBehaviorWizard.buildPayload();

      await saveRule({
        editingRule: guidedBehaviorWizard.editingRule,
        payload: {
          ...payload,
          scope: payload.scope ?? "entry",
          supported_sides_json: payload.supported_sides_json ?? "[]",
        },
      });

      guidedBehaviorWizard.close();
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
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#050713",
      }}
    >
      <ScreenGlow position="topRight" />
      <ScreenGlow position="bottomLeft" />
      <ScreenGlow position="center" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: layout.insets.top + premium.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + 112,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: premium.spacing.md,
        }}
      >
        <WorkshopHeader
          systemCount={systemRules.length}
          customCount={customRules.length}
          onOpenInfo={() => setShowInfoModal(true)}
        />

        <View style={{ gap: 10 }}>
          <SectionHeader
            title="Créer un comportement"
            description="Un seul parcours guidé, simple au départ, mais capable de construire des comportements avancés."
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: premium.spacing.sm,
            }}
          >
            <ActionButton
              title="Nouveau comportement"
              description="Crée une règle de lecture pour tes dés : somme, seuil, succès, paliers, critiques ou effets avancés."
              badge="Créer"
              onPress={guidedBehaviorWizard.open}
              variant="accent"
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <SectionHeader
            title="Bibliothèque"
            description="Comportements disponibles pour tes tables, profils et actions."
          />

          <RulesListSection
            systemRules={systemRules}
            customRules={customRules}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
            onShowSystemDetails={setSelectedSystemBehavior}
          />
        </View>
      </ScrollView>

      <BehaviorInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      <SystemBehaviorDetailsModal
        item={selectedSystemBehavior}
        onClose={() => setSelectedSystemBehavior(null)}
      />

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

      <CreateGuidedBehaviorWizardModal
        visible={guidedBehaviorWizard.visible}
        step={guidedBehaviorWizard.step}
        stepIndex={guidedBehaviorWizard.stepIndex}
        totalSteps={guidedBehaviorWizard.totalSteps}
        draft={guidedBehaviorWizard.draft}
        error={guidedBehaviorWizard.error}
        onClose={guidedBehaviorWizard.close}
        onBack={guidedBehaviorWizard.goBack}
        onNext={guidedBehaviorWizard.goNext}
        onSubmit={handleCreateFromWizard}
        onUpdateIdentity={guidedBehaviorWizard.updateIdentity}
        onSetIntent={guidedBehaviorWizard.setIntent}
        onSetDiceCompatibility={guidedBehaviorWizard.setDiceCompatibility}
        onSetApplicationMode={guidedBehaviorWizard.setApplicationMode}
        onUpdateReroll={guidedBehaviorWizard.updateReroll}
        onUpdateExplode={guidedBehaviorWizard.updateExplode}
        onUpdateKeepDrop={guidedBehaviorWizard.updateKeepDrop}
        onUpdateReading={guidedBehaviorWizard.updateReading}
        onUpdateTableRange={guidedBehaviorWizard.updateTableRange}
        onAddTableRange={guidedBehaviorWizard.addTableRange}
        onRemoveTableRange={guidedBehaviorWizard.removeTableRange}
        onUpdateCriticalSuccess={guidedBehaviorWizard.updateCriticalSuccess}
        onUpdateCriticalFailure={guidedBehaviorWizard.updateCriticalFailure}
        onUpdateComplication={guidedBehaviorWizard.updateComplication}
        onUpdateOutput={guidedBehaviorWizard.updateOutput}
        onOpenPreview={guidedBehaviorPreview.open}
      />

      <GuidedBehaviorPreviewModal
        visible={guidedBehaviorPreview.visible}
        allowedDice={guidedBehaviorPreview.allowedDice}
        selectedSides={guidedBehaviorPreview.selectedSides}
        quantity={guidedBehaviorPreview.quantity}
        modifier={guidedBehaviorPreview.modifier}
        lastRolls={guidedBehaviorPreview.lastRolls}
        resultText={guidedBehaviorPreview.resultText}
        error={guidedBehaviorPreview.error}
        onClose={guidedBehaviorPreview.close}
        onSelectSides={guidedBehaviorPreview.setSelectedSides}
        onIncrementQuantity={guidedBehaviorPreview.incrementQuantity}
        onDecrementQuantity={guidedBehaviorPreview.decrementQuantity}
        onIncrementModifier={guidedBehaviorPreview.incrementModifier}
        onDecrementModifier={guidedBehaviorPreview.decrementModifier}
        onRollPreview={guidedBehaviorPreview.rollPreview}
      />
    </View>
  );
}
