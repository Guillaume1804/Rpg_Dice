// dice-universal/features/roll/components/PreparedRollSaveSheet.tsx

import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  PremiumBottomSheet,
  PremiumOverlayTextInput,
} from "../../../components/premium";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

type SaveMode =
  | "new_table_new_profile"
  | "existing_table_new_profile"
  | "existing_table_existing_profile";

type SaveTargetProfile = {
  id: string;
  name: string;
};

type SaveTargetTable = {
  table: {
    id: string;
    name: string;
    is_system: number;
  };
  profiles: SaveTargetProfile[];
};

type PreparedRollSaveSource = "free" | "action_draft";

type Props = {
  visible: boolean;
  source: PreparedRollSaveSource | null;

  defaultTableId?: string | null;
  defaultProfileId?: string | null;

  initialTableName: string;
  initialProfileName: string;
  availableTargets: SaveTargetTable[];
  loadingTargets?: boolean;

  freeActionName: string;
  onChangeFreeActionName: (value: string) => void;

  actionLabel?: string | null;
  tableIsSystem?: boolean;

  copyName: string;
  onChangeCopyName: (value: string) => void;
  onPrepareCopyName: () => void;

  onClose: () => void;

  onConfirmFreeSave: (params: {
    mode: SaveMode;
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) => void | Promise<void>;

  onUpdateExistingAction: () => void | Promise<void>;
  onCreateActionCopy: () => void | Promise<void>;
};

function SectionLabel({ children }: { children: string }) {
  const premium = usePremiumTheme();

  return (
    <Text
      style={{
        color: premium.colors.text.muted,
        fontSize: premium.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function OptionCard({
  label,
  description,
  selected,
  disabled,
  danger,
  onPress,
}: {
  label: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  const borderColor = selected
    ? premium.colors.border.accent
    : danger
      ? "rgba(239, 111, 145, 0.32)"
      : premium.colors.border.subtle;

  const backgroundColor = selected
    ? premium.colors.accent.soft
    : danger
      ? premium.colors.state.failureSoft
      : premium.colors.surface.subtle;

  const titleColor = danger
    ? premium.colors.state.failure
    : selected
      ? premium.colors.accent.primary
      : premium.colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 64,
        borderRadius: premium.radius.lg,
        borderWidth: 1,
        borderColor,
        backgroundColor:
          pressed && !disabled
            ? premium.colors.surface.pressed
            : backgroundColor,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 4,
        opacity: disabled ? 0.42 : pressed ? 0.86 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: titleColor,
            fontSize: 14,
            fontWeight: "900",
          }}
        >
          {label}
        </Text>

        {selected ? (
          <Text
            style={{
              color: premium.colors.accent.primary,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            ✓
          </Text>
        ) : null}
      </View>

      {description ? (
        <Text
          numberOfLines={2}
          style={{
            color: premium.colors.text.secondary,
            fontSize: 12,
            fontWeight: "700",
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function SheetButton({
  label,
  onPress,
  variant = "default",
  disabled,
}: {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "default" | "accent" | "danger";
  disabled?: boolean;
}) {
  const premium = usePremiumTheme();

  const isAccent = variant === "accent";
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={() => {
        void onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 48,
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : isAccent
            ? premium.colors.border.accent
            : isDanger
              ? "rgba(239, 111, 145, 0.34)"
              : premium.colors.border.subtle,
        borderRadius: premium.radius.pill,
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : isAccent
            ? premium.colors.accent.soft
            : isDanger
              ? premium.colors.state.failureSoft
              : pressed
                ? premium.colors.surface.pressed
                : premium.colors.surface.subtle,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.48 : pressed ? 0.84 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: disabled
            ? premium.colors.text.muted
            : isAccent
              ? premium.colors.accent.primary
              : isDanger
                ? premium.colors.state.failure
                : premium.colors.text.secondary,
          fontSize: 14,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PreparedRollSaveSheet({
  visible,
  source,
  defaultTableId = null,
  defaultProfileId = null,
  initialTableName,
  initialProfileName,
  availableTargets,
  loadingTargets = false,
  freeActionName,
  onChangeFreeActionName,
  actionLabel,
  tableIsSystem = false,
  copyName,
  onChangeCopyName,
  onPrepareCopyName,
  onClose,
  onConfirmFreeSave,
  onUpdateExistingAction,
  onCreateActionCopy,
}: Props) {
  const premium = usePremiumTheme();

  const [freeMode, setFreeMode] = useState<SaveMode>("new_table_new_profile");
  const [tableName, setTableName] = useState(initialTableName);
  const [profileName, setProfileName] = useState(initialProfileName);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [actionMode, setActionMode] = useState<"menu" | "copy_name">("menu");

  useEffect(() => {
    if (!visible) return;

    setTableName(initialTableName);
    setProfileName(initialProfileName);
    setActionMode("menu");

    const defaultTarget =
      availableTargets.find((entry) => entry.table.id === defaultTableId) ??
      availableTargets[0] ??
      null;

    const nextTableId = defaultTarget?.table.id ?? null;

    const defaultProfile =
      defaultTarget?.profiles.find(
        (profile) => profile.id === defaultProfileId,
      ) ??
      defaultTarget?.profiles[0] ??
      null;

    const nextProfileId = defaultProfile?.id ?? null;

    setSelectedTableId(nextTableId);
    setSelectedProfileId(nextProfileId);

    if (source === "free" && nextTableId && nextProfileId) {
      setFreeMode("existing_table_existing_profile");
      return;
    }

    if (source === "free" && nextTableId) {
      setFreeMode("existing_table_new_profile");
      return;
    }

    setFreeMode("new_table_new_profile");
  }, [
    visible,
    source,
    initialTableName,
    initialProfileName,
    availableTargets,
    defaultTableId,
    defaultProfileId,
  ]);

  const selectedTable = useMemo(
    () =>
      availableTargets.find((entry) => entry.table.id === selectedTableId) ??
      null,
    [availableTargets, selectedTableId],
  );

  useEffect(() => {
    if (!selectedTable) {
      setSelectedProfileId(null);
      return;
    }

    const exists = selectedTable.profiles.some(
      (profile) => profile.id === selectedProfileId,
    );

    if (!exists) {
      setSelectedProfileId(selectedTable.profiles[0]?.id ?? null);
    }
  }, [selectedTable, selectedProfileId]);

  function handleConfirmFreeSave() {
    if (freeMode === "new_table_new_profile") {
      void onConfirmFreeSave({
        mode: freeMode,
        tableName,
        profileName,
      });
      return;
    }

    if (freeMode === "existing_table_new_profile") {
      void onConfirmFreeSave({
        mode: freeMode,
        tableId: selectedTableId ?? undefined,
        profileName,
      });
      return;
    }

    void onConfirmFreeSave({
      mode: freeMode,
      tableId: selectedTableId ?? undefined,
      profileId: selectedProfileId ?? undefined,
    });
  }

  const title =
    source === "action_draft"
      ? actionMode === "copy_name"
        ? "Nommer la copie"
        : "Sauvegarder l’action"
      : "Sauvegarder ce jet";

  const subtitle =
    source === "action_draft"
      ? actionMode === "copy_name"
        ? "Cette copie sera ajoutée au profil actif sans modifier l’action d’origine."
        : actionLabel
          ? `Action modifiée : ${actionLabel}`
          : "Choisis comment conserver cette version modifiée."
      : "Transforme ton jet rapide en action réutilisable dans une table.";

  return (
    <PremiumBottomSheet
      visible={visible && source !== null}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      maxHeight="88%"
      footer={
        source === "free" ? (
          <View
            style={{
              flexDirection: "row",
              gap: premium.spacing.sm,
            }}
          >
            <SheetButton label="Annuler" onPress={onClose} />
            <SheetButton
              label="Valider"
              onPress={handleConfirmFreeSave}
              variant="accent"
              disabled={freeActionName.trim().length === 0}
            />
          </View>
        ) : actionMode === "copy_name" ? (
          <View
            style={{
              flexDirection: "row",
              gap: premium.spacing.sm,
            }}
          >
            <SheetButton label="Retour" onPress={() => setActionMode("menu")} />
            <SheetButton
              label="Créer la copie"
              onPress={onCreateActionCopy}
              variant="accent"
              disabled={copyName.trim().length === 0}
            />
          </View>
        ) : null
      }
    >
      {source === "free" ? (
        <View style={{ gap: premium.spacing.md }}>
          <View>
            <PremiumOverlayTextInput
              label="Nom de l’action"
              value={freeActionName}
              onChangeText={onChangeFreeActionName}
              placeholder="Ex: Attaque, Perception, Dégâts..."
            />
          </View>

          <View style={{ gap: premium.spacing.sm }}>
            <SectionLabel>Destination</SectionLabel>

            <OptionCard
              label="Nouvelle table + nouveau profil"
              description="Crée un nouvel espace complet pour ce jet."
              selected={freeMode === "new_table_new_profile"}
              onPress={() => setFreeMode("new_table_new_profile")}
            />

            <OptionCard
              label="Table existante + nouveau profil"
              description="Ajoute ce jet dans une table existante, avec un nouveau profil."
              selected={freeMode === "existing_table_new_profile"}
              onPress={() => setFreeMode("existing_table_new_profile")}
            />

            <OptionCard
              label="Table existante + profil existant"
              description="Ajoute ce jet à un profil déjà créé."
              selected={freeMode === "existing_table_existing_profile"}
              onPress={() => setFreeMode("existing_table_existing_profile")}
            />
          </View>

          {freeMode === "new_table_new_profile" ? (
            <View style={{ gap: premium.spacing.md }}>
              <View>
                <PremiumOverlayTextInput
                  label="Nom de la table"
                  value={tableName}
                  onChangeText={setTableName}
                  placeholder="Ex: Cthulu, Warhammer, D&D..."
                />
              </View>

              <View>
                <PremiumOverlayTextInput
                  label="Nom du profil"
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Nom du profil"
                />
              </View>
            </View>
          ) : null}

          {freeMode === "existing_table_new_profile" ? (
            <View style={{ gap: premium.spacing.md }}>
              <View style={{ gap: premium.spacing.sm }}>
                <SectionLabel>Table existante</SectionLabel>

                {loadingTargets ? (
                  <OptionCard
                    label="Chargement…"
                    description="Recherche des destinations disponibles."
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : availableTargets.length === 0 ? (
                  <OptionCard
                    label="Aucune table disponible"
                    description="Crée d’abord une table ou choisis une nouvelle destination."
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : (
                  availableTargets.map((entry) => (
                    <OptionCard
                      key={entry.table.id}
                      label={entry.table.name}
                      description={`${entry.profiles.length} profil${
                        entry.profiles.length > 1 ? "s" : ""
                      }`}
                      selected={selectedTableId === entry.table.id}
                      onPress={() => setSelectedTableId(entry.table.id)}
                    />
                  ))
                )}
              </View>

              <View>
                <PremiumOverlayTextInput
                  label="Nom du nouveau profil"
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Nom du profil"
                />
              </View>
            </View>
          ) : null}

          {freeMode === "existing_table_existing_profile" ? (
            <View style={{ gap: premium.spacing.md }}>
              <View style={{ gap: premium.spacing.sm }}>
                <SectionLabel>Table existante</SectionLabel>

                {loadingTargets ? (
                  <OptionCard
                    label="Chargement…"
                    description="Recherche des destinations disponibles."
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : availableTargets.length === 0 ? (
                  <OptionCard
                    label="Aucune table disponible"
                    description="Aucune destination existante n’est disponible."
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : (
                  availableTargets.map((entry) => (
                    <OptionCard
                      key={entry.table.id}
                      label={entry.table.name}
                      selected={selectedTableId === entry.table.id}
                      onPress={() => setSelectedTableId(entry.table.id)}
                    />
                  ))
                )}
              </View>

              <View style={{ gap: premium.spacing.sm }}>
                <SectionLabel>Profil existant</SectionLabel>

                {!selectedTable ? (
                  <OptionCard
                    label="Sélectionne d’abord une table"
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : selectedTable.profiles.length === 0 ? (
                  <OptionCard
                    label="Aucun profil"
                    description="Cette table ne contient aucun profil."
                    selected={false}
                    disabled
                    onPress={() => undefined}
                  />
                ) : (
                  selectedTable.profiles.map((profile) => (
                    <OptionCard
                      key={profile.id}
                      label={profile.name}
                      selected={selectedProfileId === profile.id}
                      onPress={() => setSelectedProfileId(profile.id)}
                    />
                  ))
                )}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {source === "action_draft" && actionMode === "menu" ? (
        <View style={{ gap: premium.spacing.sm }}>
          {tableIsSystem ? (
            <OptionCard
              label="Table système protégée"
              description="Cette action ne peut pas être modifiée directement. Crée plutôt une copie."
              selected={false}
              disabled
              danger
              onPress={() => undefined}
            />
          ) : (
            <OptionCard
              label="Mettre à jour l’action existante"
              description="Remplace l’action originale par cette version modifiée."
              selected={false}
              onPress={onUpdateExistingAction}
            />
          )}

          <OptionCard
            label="Créer une copie modifiée"
            description="Ajoute une nouvelle action au profil actif sans modifier l’originale."
            selected={false}
            onPress={() => {
              onPrepareCopyName();
              setActionMode("copy_name");
            }}
          />
        </View>
      ) : null}

      {source === "action_draft" && actionMode === "copy_name" ? (
        <View style={{ gap: premium.spacing.md }}>
          <View>
            <PremiumOverlayTextInput
              label="Nom de la nouvelle action"
              value={copyName}
              onChangeText={onChangeCopyName}
              placeholder="Nom de la nouvelle action"
            />
          </View>
        </View>
      ) : null}
    </PremiumBottomSheet>
  );
}
