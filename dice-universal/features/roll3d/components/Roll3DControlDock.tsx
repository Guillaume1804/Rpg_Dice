// dice-universal/features/roll3d/components/Roll3DControlDock.tsx

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import type { TableRow } from "../../../data/repositories/tablesRepo";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type {
  Roll3DActionEntryAdjustment,
  Roll3DActionEntryInsertMode,
  Roll3DDieSides,
} from "../types";
import { Roll3DDiceSelector } from "./Roll3DDiceSelector";
import { type Roll3DActionItem } from "./Roll3DActionEntrySelector";
import { Roll3DAdjustmentSheet } from "./Roll3DAdjustmentSheet";
import { Roll3DActionPickerSheet } from "./Roll3DActionPickerSheet";

type Roll3DControlMode = "dice" | "actions";

export type Roll3DProfileOption = {
  id: string;
  name: string;
  actionCount: number;
};

type Roll3DControlDockProps = {
  compact?: boolean;

  selectedSides: Roll3DDieSides;
  availableDiceSides: Roll3DDieSides[];
  diceCount: number;
  maxDice: number;

  tableName: string | null;
  tables: TableRow[];
  selectedTableId: string | null;
  profileName: string | null;
  profiles: Roll3DProfileOption[];
  selectedProfileId: string | null;
  actions: Roll3DActionItem[];
  selectedActionId: string | null;
  selectedActionEntryId: string | null;
  actionEntryInsertMode: Roll3DActionEntryInsertMode;
  actionEntryAdjustment: Roll3DActionEntryAdjustment | null;

  onSelectSides: (sides: Roll3DDieSides) => void;
  onClearDice: () => void;
  onSelectProfile: (profileId: string) => void;
  onSelectAction: (actionId: string) => void;
  onSelectActionEntry: (params: { actionId: string; entryId: string }) => void;
  onSelectTable: (tableId: string) => void;
  onChangeActionEntryInsertMode: (mode: Roll3DActionEntryInsertMode) => void;

  onAdjustActionEntry: (params: { actionId: string; entryId: string }) => void;
  onChangeActionEntryAdjustmentQty: (delta: number) => void;
  onChangeActionEntryAdjustmentModifier: (delta: number) => void;
  onToggleActionEntryAdjustmentSign: () => void;
  onChangeActionEntryBehaviorParam: (params: {
    paramsKey: string;
    value: unknown;
  }) => void;
  onCloseActionEntryAdjustment: () => void;
};

function DockTab({
  label,
  selected,
  disabled,
  badge,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  badge?: string | null;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: disabled ? 0.42 : pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 32,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: selected
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
          backgroundColor: selected
            ? premium.colors.accent.soft
            : "rgba(255,255,255,0.04)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 5,
          paddingHorizontal: 9,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          {label}
        </Text>

        {badge ? (
          <View
            style={{
              minWidth: 17,
              height: 17,
              borderRadius: premium.radius.pill,
              backgroundColor: selected
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <Text
              style={{
                color: selected
                  ? premium.colors.text.inverse
                  : premium.colors.text.muted,
                fontSize: 8,
                fontWeight: "900",
              }}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function DockClearButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 32,
        minWidth: 62,
        borderRadius: premium.radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? premium.colors.border.subtle
          : "rgba(239, 111, 145, 0.34)",
        backgroundColor: disabled
          ? premium.colors.surface.disabled
          : pressed
            ? premium.colors.surface.pressed
            : premium.colors.state.failureSoft,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? premium.colors.text.muted
            : premium.colors.state.failure,
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.65,
        }}
      >
        Vider
      </Text>
    </Pressable>
  );
}

function ContextPill({
  label,
  value,
  disabled,
  onPress,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        opacity: disabled ? 0.46 : pressed ? 0.82 : 1,
        transform: [
          {
            scale: pressed && !disabled ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          minHeight: 31,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: onPress
            ? "rgba(232, 200, 120, 0.18)"
            : premium.colors.border.subtle,
          backgroundColor: onPress
            ? "rgba(232, 200, 120, 0.075)"
            : "rgba(255,255,255,0.04)",
          paddingHorizontal: 9,
          justifyContent: "center",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: premium.colors.text.muted,
            fontSize: 7,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.65,
          }}
        >
          {label}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: onPress
              ? premium.colors.accent.primary
              : premium.colors.text.secondary,
            fontSize: 10,
            fontWeight: "900",
            marginTop: 0,
          }}
        >
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

function Roll3DProfileSelectorModal({
  visible,
  profiles,
  selectedProfileId,
  onClose,
  onSelectProfile,
}: {
  visible: boolean;
  profiles: Roll3DProfileOption[];
  selectedProfileId: string | null;
  onClose: () => void;
  onSelectProfile: (profileId: string) => void;
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
          backgroundColor: "rgba(0,0,0,0.66)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.22)",
            backgroundColor: "rgba(12, 14, 24, 0.98)",
            padding: 18,
            gap: 12,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: "rgba(232, 200, 120, 0.94)",
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Profil actif
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.94)",
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              Choisir un profil
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.56)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 18,
              }}
            >
              Les actions disponibles dans Roll3D seront mises à jour
              immédiatement.
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {profiles.length === 0 ? (
              <View
                style={{
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.045)",
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.74)",
                    fontSize: 12,
                    fontWeight: "800",
                    lineHeight: 17,
                  }}
                >
                  Aucun profil disponible pour cette table.
                </Text>
              </View>
            ) : (
              profiles.map((profile) => {
                const selected = profile.id === selectedProfileId;

                return (
                  <Pressable
                    key={`roll-3d-profile-option-${profile.id}`}
                    onPress={() => {
                      onSelectProfile(profile.id);
                      onClose();
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.78 : 1,
                      transform: [
                        {
                          scale: pressed ? premium.animation.pressScale : 1,
                        },
                      ],
                    })}
                  >
                    <View
                      style={{
                        minHeight: 50,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: selected
                          ? "rgba(232, 200, 120, 0.34)"
                          : "rgba(255,255,255,0.08)",
                        backgroundColor: selected
                          ? "rgba(232, 200, 120, 0.10)"
                          : "rgba(255,255,255,0.045)",
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            color: selected
                              ? "rgba(232, 200, 120, 0.96)"
                              : "rgba(255,255,255,0.92)",
                            fontSize: 13,
                            fontWeight: "900",
                          }}
                        >
                          {profile.name}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={{
                            color: "rgba(255,255,255,0.52)",
                            fontSize: 10,
                            fontWeight: "800",
                            marginTop: 3,
                          }}
                        >
                          {profile.actionCount} action
                          {profile.actionCount > 1 ? "s" : ""}
                        </Text>
                      </View>

                      {selected ? (
                        <Text
                          style={{
                            color: "rgba(232, 200, 120, 0.96)",
                            fontSize: 12,
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: 0.6,
                          }}
                        >
                          Actif
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <View
              style={{
                minHeight: 42,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.045)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.66)",
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

function Roll3DTableSelectorModal({
  visible,
  tables,
  selectedTableId,
  onClose,
  onSelectTable,
}: {
  visible: boolean;
  tables: TableRow[];
  selectedTableId: string | null;
  onClose: () => void;
  onSelectTable: (tableId: string) => void;
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
          backgroundColor: "rgba(0,0,0,0.66)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.22)",
            backgroundColor: "rgba(12, 14, 24, 0.98)",
            padding: 18,
            gap: 12,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: "rgba(232, 200, 120, 0.94)",
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Table active
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.94)",
                fontSize: 20,
                fontWeight: "900",
              }}
            >
              Choisir une table
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.56)",
                fontSize: 12,
                fontWeight: "700",
                lineHeight: 18,
              }}
            >
              Changer de table réinitialise le lancer en cours et recharge les
              profils/actions disponibles.
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {tables.map((table) => {
              const selected = table.id === selectedTableId;

              return (
                <Pressable
                  key={`roll-3d-table-option-${table.id}`}
                  onPress={() => {
                    onSelectTable(table.id);
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.78 : 1,
                    transform: [
                      {
                        scale: pressed ? premium.animation.pressScale : 1,
                      },
                    ],
                  })}
                >
                  <View
                    style={{
                      minHeight: 50,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: selected
                        ? "rgba(232, 200, 120, 0.34)"
                        : "rgba(255,255,255,0.08)",
                      backgroundColor: selected
                        ? "rgba(232, 200, 120, 0.10)"
                        : "rgba(255,255,255,0.045)",
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: selected
                            ? "rgba(232, 200, 120, 0.96)"
                            : "rgba(255,255,255,0.92)",
                          fontSize: 13,
                          fontWeight: "900",
                        }}
                      >
                        {table.name}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: "rgba(255,255,255,0.52)",
                          fontSize: 10,
                          fontWeight: "800",
                          marginTop: 3,
                        }}
                      >
                        {table.is_system === 1
                          ? "Table système"
                          : "Table utilisateur"}
                      </Text>
                    </View>

                    {selected ? (
                      <Text
                        style={{
                          color: "rgba(232, 200, 120, 0.96)",
                          fontSize: 12,
                          fontWeight: "900",
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                        }}
                      >
                        Active
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <View
              style={{
                minHeight: 42,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.045)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.66)",
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

function Roll3DActionDockSummary({
  profileName,
  actionsCount,
  selectedActionName,
  selectedEntryLabel,
  onOpen,
}: {
  profileName: string | null;
  actionsCount: number;
  selectedActionName: string | null;
  selectedEntryLabel: string | null;
  onOpen: () => void;
}) {
  const premium = usePremiumTheme();

  const hasSelection = !!selectedActionName || !!selectedEntryLabel;

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => ({
        opacity: pressed ? 0.82 : 1,
        transform: [
          {
            scale: pressed ? premium.animation.pressScale : 1,
          },
        ],
      })}
    >
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 7,
          gap: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                color: premium.colors.text.muted,
                fontSize: 9,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Jets préparés
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: hasSelection
                  ? premium.colors.accent.primary
                  : premium.colors.text.secondary,
                fontSize: 12,
                fontWeight: "900",
                marginTop: 2,
              }}
            >
              {selectedEntryLabel ??
                selectedActionName ??
                `${actionsCount} jet${actionsCount > 1 ? "s" : ""} disponible${actionsCount > 1 ? "s" : ""}`}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: premium.colors.text.muted,
                fontSize: 9,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {profileName
                ? hasSelection
                  ? "Toucher pour choisir ou ajuster"
                  : `Profil : ${profileName}`
                : "Aucun profil actif"}
            </Text>
          </View>

          <View
            style={{
              borderRadius: premium.radius.pill,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.22)",
              backgroundColor: "rgba(232, 200, 120, 0.08)",
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Ouvrir
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Roll3DDraftHudSummary({
  mode,
  diceCount,
  selectedSides,
  selectedEntryLabel,
  selectedActionName,
}: {
  mode: Roll3DControlMode;
  diceCount: number;
  selectedSides: Roll3DDieSides;
  selectedEntryLabel: string | null;
  selectedActionName: string | null;
}) {
  const premium = usePremiumTheme();

  const hasDice = diceCount > 0;

  const title =
    mode === "actions"
      ? (selectedEntryLabel ?? selectedActionName ?? "Action prête")
      : hasDice
        ? `${diceCount} dé${diceCount > 1 ? "s" : ""} sur la table`
        : "Table vide";

  const subtitle =
    mode === "actions"
      ? hasDice
        ? `${diceCount} dé${diceCount > 1 ? "s" : ""} prêt${diceCount > 1 ? "s" : ""}`
        : "Choisis un jet préparé"
      : hasDice
        ? `Dernier dé sélectionné : d${selectedSides}`
        : "Ajoute des dés ou choisis une action";

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: hasDice
            ? premium.colors.accent.primary
            : premium.colors.text.secondary,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: premium.colors.text.muted,
          fontSize: 9,
          fontWeight: "800",
          marginTop: 2,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function HudCluster({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: compact ? 22 : 24,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.10)",
        backgroundColor: "rgba(5, 7, 19, 0.50)",
        padding: compact ? 5 : 6,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

export function Roll3DControlDock({
  compact = true,
  selectedSides,
  availableDiceSides,
  diceCount,
  maxDice,
  tableName,
  tables,
  selectedTableId,
  profileName,
  profiles,
  selectedProfileId,
  actions,
  selectedActionId,
  selectedActionEntryId,
  actionEntryInsertMode,
  actionEntryAdjustment,
  onSelectSides,
  onClearDice,
  onSelectTable,
  onSelectProfile,
  onSelectAction,
  onSelectActionEntry,
  onChangeActionEntryInsertMode,
  onAdjustActionEntry,
  onChangeActionEntryAdjustmentQty,
  onChangeActionEntryAdjustmentModifier,
  onToggleActionEntryAdjustmentSign,
  onChangeActionEntryBehaviorParam,
  onCloseActionEntryAdjustment,
}: Roll3DControlDockProps) {
  // const premium = usePremiumTheme();

  const hasActions = actions.length > 0;

  const defaultMode = useMemo<Roll3DControlMode>(
    () => (hasActions ? "actions" : "dice"),
    [hasActions],
  );

  const [mode, setMode] = useState<Roll3DControlMode>(defaultMode);

  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const [showTableSelector, setShowTableSelector] = useState(false);

  const [showActionPicker, setShowActionPicker] = useState(false);

  const [showAdjustmentSheet, setShowAdjustmentSheet] = useState(false);

  const safeMode: Roll3DControlMode =
    mode === "actions" && !hasActions ? "dice" : mode;

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (!actionEntryAdjustment) {
      setShowAdjustmentSheet(false);
    }
  }, [actionEntryAdjustment]);

  function handleAdjustEntry(params: { actionId: string; entryId: string }) {
    onAdjustActionEntry(params);
    setShowActionPicker(false);
    setShowAdjustmentSheet(true);
  }

  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;

  const selectedEntry =
    selectedAction?.entries.find(
      (entry) => entry.id === selectedActionEntryId,
    ) ?? null;

  return (
    <View
      style={{
        borderRadius: 28,
        borderWidth: 0,
        backgroundColor: "transparent",
        padding: 0,
        gap: 7,
        overflow: "visible",
      }}
    >
      <HudCluster compact>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
        >
          <ContextPill
            label="Table"
            value={tableName ?? "Aucune table"}
            disabled={!tableName}
            onPress={
              tables.length > 1 ? () => setShowTableSelector(true) : undefined
            }
          />

          <ContextPill
            label="Profil"
            value={profileName ?? "Aucun profil"}
            disabled={!profileName}
            onPress={
              profiles.length > 1
                ? () => setShowProfileSelector(true)
                : undefined
            }
          />
        </View>
      </HudCluster>

      <HudCluster compact>
        <Roll3DDraftHudSummary
          mode={safeMode}
          diceCount={diceCount}
          selectedSides={selectedSides}
          selectedActionName={selectedAction?.name ?? null}
          selectedEntryLabel={selectedEntry?.label ?? null}
        />
      </HudCluster>

      <HudCluster compact>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              gap: 6,
            }}
          >
            <DockTab
              label="Dés libres"
              selected={safeMode === "dice"}
              onPress={() => setMode("dice")}
            />

            <DockTab
              label="Actions"
              selected={safeMode === "actions"}
              disabled={!hasActions}
              badge={hasActions ? String(actions.length) : null}
              onPress={() => {
                setMode("actions");
                setShowActionPicker(true);
              }}
            />
          </View>

          <DockClearButton disabled={diceCount <= 0} onPress={onClearDice} />
        </View>
      </HudCluster>

      <HudCluster>
        {safeMode === "actions" ? (
          <Roll3DActionDockSummary
            profileName={profileName}
            actionsCount={actions.length}
            selectedActionName={selectedAction?.name ?? null}
            selectedEntryLabel={selectedEntry?.label ?? null}
            onOpen={() => setShowActionPicker(true)}
          />
        ) : (
          <Roll3DDiceSelector
            compact={compact}
            selectedSides={selectedSides}
            availableSides={availableDiceSides}
            diceCount={diceCount}
            maxDice={maxDice}
            onSelectSides={onSelectSides}
            onClearDice={undefined}
          />
        )}
      </HudCluster>

      <Roll3DActionPickerSheet
        visible={showActionPicker}
        profileName={profileName}
        actions={actions}
        selectedActionId={selectedActionId}
        selectedEntryId={selectedActionEntryId}
        insertMode={actionEntryInsertMode}
        onClose={() => setShowActionPicker(false)}
        onSelectAction={onSelectAction}
        onSelectEntry={onSelectActionEntry}
        onChangeInsertMode={onChangeActionEntryInsertMode}
        onAdjustEntry={handleAdjustEntry}
      />

      <Roll3DAdjustmentSheet
        visible={showAdjustmentSheet && !!actionEntryAdjustment}
        adjustment={actionEntryAdjustment}
        onClose={() => {
          setShowAdjustmentSheet(false);
          onCloseActionEntryAdjustment();
        }}
        onApply={() => {
          setShowAdjustmentSheet(false);
        }}
        onChangeQty={onChangeActionEntryAdjustmentQty}
        onChangeModifier={onChangeActionEntryAdjustmentModifier}
        onToggleSign={onToggleActionEntryAdjustmentSign}
        onChangeBehaviorParam={onChangeActionEntryBehaviorParam}
      />

      <Roll3DProfileSelectorModal
        visible={showProfileSelector}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onClose={() => setShowProfileSelector(false)}
        onSelectProfile={onSelectProfile}
      />

      <Roll3DTableSelectorModal
        visible={showTableSelector}
        tables={tables}
        selectedTableId={selectedTableId}
        onClose={() => setShowTableSelector(false)}
        onSelectTable={onSelectTable}
      />
    </View>
  );
}
