// dice-universal/features/roll3d/components/Roll3DControlDock.tsx

import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DDieSides } from "../types";
import { Roll3DDiceSelector } from "./Roll3DDiceSelector";
import { Roll3DRollButton } from "./Roll3DRollButton";
import {
  Roll3DSetSelector,
  type Roll3DSetSelectorItem,
} from "./Roll3DSetSelector";

type Roll3DSetInsertMode = "replace" | "append";

type Roll3DControlMode = "dice" | "sets";

type Roll3DControlDockProps = {
  compact?: boolean;

  selectedSides: Roll3DDieSides;
  diceCount: number;
  maxDice: number;
  rollDisabled?: boolean;

  profileName: string | null;
  sets: Roll3DSetSelectorItem[];
  selectedSetId: string | null;
  selectedSetEntryId: string | null;
  setInsertMode: Roll3DSetInsertMode;

  onSelectSides: (sides: Roll3DDieSides) => void;
  onClearDice: () => void;
  onSelectSet: (setId: string) => void;
  onSelectSetEntry: (params: { setId: string; entryId: string }) => void;
  onChangeSetInsertMode: (mode: Roll3DSetInsertMode) => void;
  onRoll: () => void;
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

export function Roll3DControlDock({
  compact = true,
  selectedSides,
  diceCount,
  maxDice,
  rollDisabled = false,
  profileName,
  sets,
  selectedSetEntryId,
  setInsertMode,
  onSelectSetEntry,
  onChangeSetInsertMode,
  selectedSetId,
  onSelectSides,
  onClearDice,
  onSelectSet,
  onRoll,
}: Roll3DControlDockProps) {
  // const premium = usePremiumTheme();

  const hasSets = sets.length > 0;

  const defaultMode = useMemo<Roll3DControlMode>(
    () => (hasSets ? "sets" : "dice"),
    [hasSets],
  );

  const [mode, setMode] = useState<Roll3DControlMode>(defaultMode);

  const safeMode: Roll3DControlMode =
    mode === "sets" && !hasSets ? "dice" : mode;

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
        }}
      >
        <DockTab
          label="Dés libres"
          selected={safeMode === "dice"}
          onPress={() => setMode("dice")}
        />

        <DockTab
          label="Sets"
          selected={safeMode === "sets"}
          disabled={!hasSets}
          badge={hasSets ? String(sets.length) : null}
          onPress={() => setMode("sets")}
        />
      </View>

      {safeMode === "sets" ? (
        <Roll3DSetSelector
          compact={compact}
          profileName={profileName}
          sets={sets}
          selectedSetId={selectedSetId}
          selectedEntryId={selectedSetEntryId}
          insertMode={setInsertMode}
          onSelectSet={onSelectSet}
          onSelectEntry={onSelectSetEntry}
          onChangeInsertMode={onChangeSetInsertMode}
        />
      ) : (
        <Roll3DDiceSelector
          compact={compact}
          selectedSides={selectedSides}
          diceCount={diceCount}
          maxDice={maxDice}
          onSelectSides={onSelectSides}
          onClearDice={onClearDice}
        />
      )}

      <Roll3DRollButton
        compact={compact}
        disabled={rollDisabled}
        diceCount={diceCount}
        onPress={onRoll}
      />
    </View>
  );
}
