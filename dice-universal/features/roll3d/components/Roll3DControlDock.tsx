// dice-universal/features/roll3d/components/Roll3DControlDock.tsx

import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type {
  Roll3DActionEntryAdjustment,
  Roll3DActionEntryInsertMode,
  Roll3DDieSides,
} from "../types";
import { Roll3DDiceSelector } from "./Roll3DDiceSelector";
import { Roll3DRollButton } from "./Roll3DRollButton";
import {
  Roll3DActionEntrySelector,
  type Roll3DActionItem,
} from "./Roll3DActionEntrySelector";
import { Roll3DActionEntryAdjustmentCard } from "./Roll3DActionEntryAdjustmentCard";

type Roll3DControlMode = "dice" | "actions";

type Roll3DControlDockProps = {
  compact?: boolean;

  selectedSides: Roll3DDieSides;
  diceCount: number;
  maxDice: number;
  rollDisabled?: boolean;

  profileName: string | null;
  actions: Roll3DActionItem[];
  selectedActionId: string | null;
  selectedActionEntryId: string | null;
  actionEntryInsertMode: Roll3DActionEntryInsertMode;
  actionEntryAdjustment: Roll3DActionEntryAdjustment | null;

  onSelectSides: (sides: Roll3DDieSides) => void;
  onClearDice: () => void;
  onSelectAction: (actionId: string) => void;
  onSelectActionEntry: (params: { actionId: string; entryId: string }) => void;
  onChangeActionEntryInsertMode: (mode: Roll3DActionEntryInsertMode) => void;
  onRoll: () => void;

  onAdjustActionEntry: (params: { actionId: string; entryId: string }) => void;
  onChangeActionEntryAdjustmentQty: (delta: number) => void;
  onChangeActionEntryAdjustmentModifier: (delta: number) => void;
  onToggleActionEntryAdjustmentSign: () => void;
  onApplyActionEntryAdjustment: (mode: Roll3DActionEntryInsertMode) => void;
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
          minHeight: 34,
          borderRadius: premium.radius.pill,
          borderWidth: 1,
          borderColor: selected
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
          backgroundColor: selected
            ? premium.colors.accent.soft
            : "rgba(255,255,255,0.045)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : premium.colors.text.secondary,
            fontSize: 11,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </Text>

        {badge ? (
          <View
            style={{
              minWidth: 18,
              height: 18,
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
                fontSize: 9,
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
        minHeight: 34,
        minWidth: 72,
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
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.75,
        }}
      >
        Vider
      </Text>
    </Pressable>
  );
}

export function Roll3DControlDock({
  compact = true,
  selectedSides,
  diceCount,
  maxDice,
  rollDisabled = false,
  profileName,
  actions,
  selectedActionEntryId,
  actionEntryInsertMode,
  actionEntryAdjustment,
  onSelectActionEntry,
  onChangeActionEntryInsertMode,
  onAdjustActionEntry,
  onChangeActionEntryAdjustmentQty,
  onChangeActionEntryAdjustmentModifier,
  onToggleActionEntryAdjustmentSign,
  onApplyActionEntryAdjustment,
  onCloseActionEntryAdjustment,
  selectedActionId,
  onSelectSides,
  onClearDice,
  onSelectAction,
  onRoll,
}: Roll3DControlDockProps) {
  // const premium = usePremiumTheme();

  const hasActions = actions.length > 0;

  const defaultMode = useMemo<Roll3DControlMode>(
    () => (hasActions ? "actions" : "dice"),
    [hasActions],
  );

  const [mode, setMode] = useState<Roll3DControlMode>(defaultMode);

  const safeMode: Roll3DControlMode =
    mode === "actions" && !hasActions ? "dice" : mode;

  return (
    <View
      style={{
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.14)",
        backgroundColor: "rgba(5, 7, 19, 0.56)",
        padding: 6,
        gap: 8,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 7,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap: 7,
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
            onPress={() => setMode("actions")}
          />
        </View>

        <DockClearButton disabled={diceCount <= 0} onPress={onClearDice} />
      </View>

      {safeMode === "actions" ? (
        <Roll3DActionEntrySelector
          compact={compact}
          profileName={profileName}
          actions={actions}
          selectedActionId={selectedActionId}
          selectedEntryId={selectedActionEntryId}
          insertMode={actionEntryInsertMode}
          onSelectAction={onSelectAction}
          onSelectEntry={onSelectActionEntry}
          onChangeInsertMode={onChangeActionEntryInsertMode}
          onAdjustEntry={onAdjustActionEntry}
        />
      ) : (
        <Roll3DDiceSelector
          compact={compact}
          selectedSides={selectedSides}
          diceCount={diceCount}
          maxDice={maxDice}
          onSelectSides={onSelectSides}
          onClearDice={undefined}
        />
      )}

      {actionEntryAdjustment ? (
        <Roll3DActionEntryAdjustmentCard
          compact={compact}
          adjustment={actionEntryAdjustment}
          onChangeQty={onChangeActionEntryAdjustmentQty}
          onChangeModifier={onChangeActionEntryAdjustmentModifier}
          onToggleSign={onToggleActionEntryAdjustmentSign}
          onApply={onApplyActionEntryAdjustment}
          onClose={onCloseActionEntryAdjustment}
        />
      ) : null}

      <Roll3DRollButton
        compact={compact}
        disabled={rollDisabled}
        diceCount={diceCount}
        onPress={onRoll}
      />
    </View>
  );
}
