// dice-universal/features/roll/components/SaveDraftModal.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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

type Props = {
  visible: boolean;
  initialTableName: string;
  initialProfileName: string;
  availableTargets: SaveTargetTable[];
  loadingTargets?: boolean;

  onCancel: () => void;
  onConfirm: (params: {
    mode: SaveMode;
    tableName?: string;
    profileName?: string;
    tableId?: string;
    profileId?: string;
  }) => void | Promise<void>;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.textSubtle,
        fontSize: arcane.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.textMuted,
        fontWeight: "800",
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

function ModalInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={arcane.colors.textSubtle}
      style={{
        color: arcane.colors.text,
        backgroundColor: arcane.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: arcane.colors.border,
        borderRadius: arcane.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 16,
      }}
    />
  );
}

function ModeOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: arcane.colors.textMuted,
          fontSize: 12,
          lineHeight: 17,
        }}
      >
        {description}
      </Text>
    </Pressable>
  );
}

function SelectOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.border,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: selected ? "900" : "800",
        }}
      >
        {label}
      </Text>

      {description ? (
        <Text
          style={{
            color: arcane.colors.textMuted,
            fontSize: 12,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function ModalButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const isAccent = variant === "accent";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: isAccent ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor: isAccent
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SaveDraftModal({
  visible,
  initialTableName,
  initialProfileName,
  availableTargets,
  loadingTargets = false,
  onCancel,
  onConfirm,
}: Props) {
  const [mode, setMode] = useState<SaveMode>("new_table_new_profile");
  const [tableName, setTableName] = useState(initialTableName);
  const [profileName, setProfileName] = useState(initialProfileName);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!visible) return;

    setMode("new_table_new_profile");
    setTableName(initialTableName);
    setProfileName(initialProfileName);

    const firstTable = availableTargets[0]?.table.id ?? null;
    setSelectedTableId(firstTable);

    const firstProfile = availableTargets[0]?.profiles[0]?.id ?? null;
    setSelectedProfileId(firstProfile);
  }, [visible, initialTableName, initialProfileName, availableTargets]);

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
      (p) => p.id === selectedProfileId,
    );

    if (!exists) {
      setSelectedProfileId(selectedTable.profiles[0]?.id ?? null);
    }
  }, [selectedTable, selectedProfileId]);

  function handleConfirm() {
    if (mode === "new_table_new_profile") {
      onConfirm({
        mode,
        tableName,
        profileName,
      });
      return;
    }

    if (mode === "existing_table_new_profile") {
      onConfirm({
        mode,
        tableId: selectedTableId ?? undefined,
        profileName,
      });
      return;
    }

    onConfirm({
      mode,
      tableId: selectedTableId ?? undefined,
      profileId: selectedProfileId ?? undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.64)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            ...arcaneStyles.card,
            gap: arcane.spacing.md,
            borderColor: arcane.colors.accent,
            maxHeight: "90%",
          }}
        >
          <View style={{ gap: arcane.spacing.xs }}>
            <Text style={arcaneStyles.sectionTitle}>Sauvegarder ce jet</Text>

            <Text style={arcaneStyles.muted}>
              Transforme ton jet rapide en action réutilisable dans une table.
            </Text>
          </View>

          <ScrollView
            style={{ maxHeight: 560 }}
            contentContainerStyle={{ gap: arcane.spacing.md }}
            showsVerticalScrollIndicator
          >
            <View style={{ gap: arcane.spacing.sm }}>
              <SectionLabel>Destination</SectionLabel>

              <ModeOption
                label="Nouvelle table + nouveau profil"
                description="Crée un nouvel espace complet pour ce jet."
                selected={mode === "new_table_new_profile"}
                onPress={() => setMode("new_table_new_profile")}
              />

              <ModeOption
                label="Table existante + nouveau profil"
                description="Ajoute ce jet dans une table existante, avec un nouveau profil."
                selected={mode === "existing_table_new_profile"}
                onPress={() => setMode("existing_table_new_profile")}
              />

              <ModeOption
                label="Table existante + profil existant"
                description="Ajoute ce jet à un profil déjà créé."
                selected={mode === "existing_table_existing_profile"}
                onPress={() => setMode("existing_table_existing_profile")}
              />
            </View>

            {mode === "new_table_new_profile" ? (
              <View style={{ gap: arcane.spacing.md }}>
                <View>
                  <FieldLabel>Nom de la table</FieldLabel>
                  <ModalInput
                    value={tableName}
                    onChangeText={setTableName}
                    placeholder="Nom de la table"
                  />
                </View>

                <View>
                  <FieldLabel>Nom du profil</FieldLabel>
                  <ModalInput
                    value={profileName}
                    onChangeText={setProfileName}
                    placeholder="Nom du profil"
                  />
                </View>
              </View>
            ) : null}

            {mode === "existing_table_new_profile" ? (
              <View style={{ gap: arcane.spacing.md }}>
                <View style={{ gap: arcane.spacing.sm }}>
                  <SectionLabel>Table existante</SectionLabel>

                  <ScrollView
                    style={{ maxHeight: 190 }}
                    contentContainerStyle={{ gap: arcane.spacing.sm }}
                    nestedScrollEnabled
                  >
                    {loadingTargets ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>Chargement…</Text>
                      </View>
                    ) : availableTargets.length === 0 ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>
                          Aucune table disponible.
                        </Text>
                      </View>
                    ) : (
                      availableTargets.map((entry) => (
                        <SelectOption
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
                  </ScrollView>
                </View>

                <View>
                  <FieldLabel>Nom du nouveau profil</FieldLabel>
                  <ModalInput
                    value={profileName}
                    onChangeText={setProfileName}
                    placeholder="Nom du profil"
                  />
                </View>
              </View>
            ) : null}

            {mode === "existing_table_existing_profile" ? (
              <View style={{ gap: arcane.spacing.md }}>
                <View style={{ gap: arcane.spacing.sm }}>
                  <SectionLabel>Table existante</SectionLabel>

                  <ScrollView
                    style={{ maxHeight: 160 }}
                    contentContainerStyle={{ gap: arcane.spacing.sm }}
                    nestedScrollEnabled
                  >
                    {loadingTargets ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>Chargement…</Text>
                      </View>
                    ) : availableTargets.length === 0 ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>
                          Aucune table disponible.
                        </Text>
                      </View>
                    ) : (
                      availableTargets.map((entry) => (
                        <SelectOption
                          key={entry.table.id}
                          label={entry.table.name}
                          selected={selectedTableId === entry.table.id}
                          onPress={() => setSelectedTableId(entry.table.id)}
                        />
                      ))
                    )}
                  </ScrollView>
                </View>

                <View style={{ gap: arcane.spacing.sm }}>
                  <SectionLabel>Profil existant</SectionLabel>

                  <ScrollView
                    style={{ maxHeight: 160 }}
                    contentContainerStyle={{ gap: arcane.spacing.sm }}
                    nestedScrollEnabled
                  >
                    {!selectedTable ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>
                          Sélectionne d’abord une table.
                        </Text>
                      </View>
                    ) : selectedTable.profiles.length === 0 ? (
                      <View style={arcaneStyles.cardSoft}>
                        <Text style={arcaneStyles.muted}>
                          Cette table ne contient aucun profil.
                        </Text>
                      </View>
                    ) : (
                      selectedTable.profiles.map((profile) => (
                        <SelectOption
                          key={profile.id}
                          label={profile.name}
                          selected={selectedProfileId === profile.id}
                          onPress={() => setSelectedProfileId(profile.id)}
                        />
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: arcane.spacing.sm,
            }}
          >
            <ModalButton label="Annuler" onPress={onCancel} />
            <ModalButton
              label="Valider"
              onPress={handleConfirm}
              variant="accent"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
