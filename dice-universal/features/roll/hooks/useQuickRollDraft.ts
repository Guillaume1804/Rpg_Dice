// useQuickRollDraft.ts
import { useState } from "react";

import { rollGroup, GroupRollResult } from "../../../core/roll/roll";
import { insertRollEvent } from "../../../data/repositories/rollEventsRepo";
import { newId } from "../../../core/types/ids";
import { evaluateRule } from "../../../core/rules/evaluate";
import type { Db } from "../../../data/db/database";
import type { TableRow } from "../../../data/repositories/tablesRepo";
import type { RuleRow } from "../../../data/repositories/rulesRepo";

export type DraftTempRule = {
  id: string;
  name: string;
  kind: string;
  params_json: string;
};

export type DraftDie = {
  sides: number;
  qty: number;
  modifier?: number;
  sign?: number;
  rule_id?: string | null;
  rule_temp?: DraftTempRule | null;
};

export type DraftGroupState = {
  id: string;
  name: string;
  rule_id?: string | null;
  rule_temp?: DraftTempRule | null;
  dice: DraftDie[];
};

export type QuickPresetSelection = {
  scope: "entry" | "group";
  rule: DraftTempRule;
};

export type UseQuickRollDraftParams = {
  db: Db;
  table: TableRow | null;
  availableRules: RuleRow[];
};

function nowIso() {
  return new Date().toISOString();
}

function createEmptyDraftGroup(name?: string): DraftGroupState {
  return {
    id: `draft-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name ?? "Groupe rapide",
    rule_id: null,
    rule_temp: null,
    dice: [],
  };
}

function createQuickGroup(
  name: string,
  rule_temp: DraftTempRule | null = null,
): DraftGroupState {
  return {
    ...createEmptyDraftGroup(name),
    rule_temp,
  };
}

function sameTempRule(
  a: DraftTempRule | null | undefined,
  b: DraftTempRule | null | undefined,
) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.kind === b.kind && a.name === b.name && a.params_json === b.params_json
  );
}

export function useQuickRollDraft({
  db,
  table,
  availableRules,
}: UseQuickRollDraftParams) {
  const [draftGroups, setDraftGroups] = useState<DraftGroupState[]>([]);
  const [draftResults, setDraftResults] = useState<GroupRollResult[]>([]);
  const [selectedDraftGroupId, setSelectedDraftGroupId] = useState<
    string | null
  >(null);

  const [showRenameDraftGroupModal, setShowRenameDraftGroupModal] =
    useState(false);
  const [renamingDraftGroupId, setRenamingDraftGroupId] = useState<
    string | null
  >(null);
  const [renameDraftGroupValue, setRenameDraftGroupValue] = useState("");

  const [showDraftGroupRuleModal, setShowDraftGroupRuleModal] = useState(false);
  const [draftGroupRuleSelection, setDraftGroupRuleSelection] = useState<
    string | null
  >(null);

  const [editingDraftGroupId, setEditingDraftGroupId] = useState<string | null>(
    null,
  );
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(
    null,
  );
  const [draftEditModifier, setDraftEditModifier] = useState("0");
  const [draftEditSign, setDraftEditSign] = useState<"1" | "-1">("1");
  const [draftEditRuleId, setDraftEditRuleId] = useState<string | null>(null);
  const [draftEditSides, setDraftEditSides] = useState("6");
  const [draftEditQty, setDraftEditQty] = useState("1");

  function resetDraftEditorState() {
    setEditingDraftGroupId(null);
    setEditingDraftIndex(null);
    setDraftEditSides("6");
    setDraftEditQty("1");
    setDraftEditModifier("0");
    setDraftEditSign("1");
    setDraftEditRuleId(null);
  }

  function resetDraftState() {
    setDraftGroups([]);
    setDraftResults([]);
    setSelectedDraftGroupId(null);

    setShowRenameDraftGroupModal(false);
    setRenamingDraftGroupId(null);
    setRenameDraftGroupValue("");

    setShowDraftGroupRuleModal(false);
    setDraftGroupRuleSelection(null);

    resetDraftEditorState();
  }

  function getNonEmptyDraftGroups(): DraftGroupState[] {
    return draftGroups.filter((group) => group.dice.length > 0);
  }

  function addDraftGroup() {
    const newGroup = createEmptyDraftGroup(`Groupe ${draftGroups.length + 1}`);
    setDraftGroups((prev) => [...prev, newGroup]);
    setSelectedDraftGroupId(newGroup.id);
    setDraftResults([]);
  }

  function addQuickStandardDie(sides: number) {
    setDraftGroups((prev) => {
      let next = [...prev];

      let targetGroup =
        next.find(
          (group) =>
            group.name === "Jet libre" &&
            !group.rule_id &&
            !group.rule_temp,
        ) ?? null;

      if (!targetGroup) {
        targetGroup = createQuickGroup("Jet libre");
        next = [...next, targetGroup];
        setSelectedDraftGroupId(targetGroup.id);
      }

      const targetGroupId = targetGroup.id;

      return next.map((group) => {
        if (group.id !== targetGroupId) return group;

        const existingIndex = group.dice.findIndex(
          (die) =>
            die.sides === sides &&
            (die.modifier ?? 0) === 0 &&
            (die.sign ?? 1) === 1 &&
            !die.rule_id &&
            !die.rule_temp,
        );

        if (existingIndex >= 0) {
          return {
            ...group,
            dice: group.dice.map((die, index) =>
              index === existingIndex
                ? {
                  ...die,
                  qty: die.qty + 1,
                }
                : die,
            ),
          };
        }

        return {
          ...group,
          dice: [
            ...group.dice,
            {
              sides,
              qty: 1,
              modifier: 0,
              sign: 1,
              rule_id: null,
              rule_temp: null,
            },
          ],
        };
      });
    });

    setDraftResults([]);
  }

  function addQuickPresetDie(sides: number, preset: QuickPresetSelection) {
    const newGroup =
      preset.scope === "group"
        ? createQuickGroup(`Jet libre — ${preset.rule.name}`, preset.rule)
        : createQuickGroup(`Jet libre — ${preset.rule.name}`);

    const newDie: DraftDie =
      preset.scope === "group"
        ? {
          sides,
          qty: 1,
          modifier: 0,
          sign: 1,
          rule_id: null,
          rule_temp: null,
        }
        : {
          sides,
          qty: 1,
          modifier: 0,
          sign: 1,
          rule_id: null,
          rule_temp: preset.rule,
        };

    setDraftGroups((prev) => [...prev, { ...newGroup, dice: [newDie] }]);
    setSelectedDraftGroupId(newGroup.id);
    setDraftResults([]);
  }

  function addDieToDraft(
    sides: number,
    forcedTempRule?: DraftTempRule | null,
    options?: { aggregate?: boolean },
  ) {
    setDraftGroups((prev) => {
      let next = [...prev];

      const resolvedTempRule =
        forcedTempRule === undefined
          ? prev
            .flatMap((group) => group.dice)
            .find((die) => die.sides === sides && die.rule_temp)?.rule_temp ?? null
          : forcedTempRule;

      const shouldAggregate = options?.aggregate !== false;

      if (next.length === 0) {
        const newGroup = createEmptyDraftGroup("Groupe rapide");
        next = [newGroup];
        setSelectedDraftGroupId(newGroup.id);
      }

      const targetGroupId = selectedDraftGroupId ?? next[0].id;

      return next.map((group) => {
        if (group.id !== targetGroupId) return group;

        const existingIndex = shouldAggregate
          ? group.dice.findIndex(
            (die) =>
              die.sides === sides &&
              (die.modifier ?? 0) === 0 &&
              (die.sign ?? 1) === 1 &&
              (die.rule_id ?? null) === null &&
              sameTempRule(die.rule_temp ?? null, resolvedTempRule),
          )
          : -1;

        if (existingIndex >= 0) {
          return {
            ...group,
            dice: group.dice.map((die, index) =>
              index === existingIndex
                ? {
                  ...die,
                  qty: die.qty + 1,
                }
                : die,
            ),
          };
        }

        return {
          ...group,
          dice: [
            ...group.dice,
            {
              sides,
              qty: 1,
              modifier: 0,
              sign: 1,
              rule_id: null,
              rule_temp: resolvedTempRule,
            },
          ],
        };
      });
    });

    setDraftResults([]);
  }

  function applyTempRuleToSides(sides: number, rule: DraftTempRule | null) {
    setDraftGroups((prev) =>
      prev.map((group) => ({
        ...group,
        dice: group.dice.map((die) =>
          die.sides === sides
            ? {
              ...die,
              rule_temp: rule,
              rule_id: rule ? null : (die.rule_id ?? null),
            }
            : die,
        ),
      })),
    );

    setDraftResults([]);
  }

  function clearTempRuleFromSides(sides: number) {
    setDraftGroups((prev) =>
      prev.map((group) => ({
        ...group,
        dice: group.dice.map((die) =>
          die.sides === sides
            ? {
              ...die,
              rule_temp: null,
            }
            : die,
        ),
      })),
    );

    setDraftResults([]);
  }

  function clearAllTempRules() {
    setDraftGroups((prev) =>
      prev.map((group) => ({
        ...group,
        rule_temp: null,
        dice: group.dice.map((die) => ({
          ...die,
          rule_temp: null,
        })),
      })),
    );

    setDraftResults([]);
  }

  function removeDraftDie(groupId: string, index: number) {
    setDraftGroups((prev) => {
      const next = prev
        .map((group) =>
          group.id === groupId
            ? { ...group, dice: group.dice.filter((_, i) => i !== index) }
            : group,
        )
        .filter((group) => group.dice.length > 0 || prev.length === 1);

      const cleaned = next.filter((group) => group.dice.length > 0);

      if (cleaned.length === 0) {
        setSelectedDraftGroupId(null);
        setDraftGroupRuleSelection(null);
        return [];
      }

      if (!cleaned.some((g) => g.id === selectedDraftGroupId)) {
        setSelectedDraftGroupId(cleaned[0].id);
      }

      return cleaned;
    });

    setDraftResults([]);
  }

  function updateDraftDieQty(groupId: string, index: number, qty: number) {
    if (!Number.isFinite(qty) || qty <= 0) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            dice: group.dice.map((die, i) =>
              i === index
                ? {
                  ...die,
                  qty,
                }
                : die,
            ),
          }
          : group,
      ),
    );

    setDraftResults([]);
  }

  function updateDraftDieEntry(
    groupId: string,
    index: number,
    values: {
      qty: number;
      modifier: number;
    },
  ) {
    if (!Number.isFinite(values.qty) || values.qty <= 0) return;
    if (!Number.isFinite(values.modifier)) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            dice: group.dice.map((die, i) =>
              i === index
                ? {
                  ...die,
                  qty: values.qty,
                  modifier: values.modifier,
                }
                : die,
            ),
          }
          : group,
      ),
    );

    setDraftResults([]);
  }

  function replaceDraftDieWithQtySplit(
    groupId: string,
    index: number,
    qty: number,
    modifier?: number,
  ) {
    if (!Number.isFinite(qty) || qty <= 0) return;

    setDraftGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;

        const targetDie = group.dice[index];
        if (!targetDie) return group;

        const nextDice = [...group.dice];
        nextDice.splice(
          index,
          1,
          ...Array.from({ length: qty }, () => ({
            ...targetDie,
            qty: 1,
            modifier: Number.isFinite(modifier ?? targetDie.modifier ?? 0)
              ? (modifier ?? targetDie.modifier ?? 0)
              : 0,
          })),
        );

        return {
          ...group,
          dice: nextDice,
        };
      }),
    );

    setDraftResults([]);
  }

  function removeDraftGroup(groupId: string) {
    setDraftGroups((prev) => {
      const next = prev.filter((group) => group.id !== groupId);

      if (next.length === 0) {
        setSelectedDraftGroupId(null);
        return [];
      }

      if (selectedDraftGroupId === groupId) {
        setSelectedDraftGroupId(next[0].id);
      }

      return next;
    });

    setDraftResults((prev) => prev.filter((r) => r.groupId !== groupId));

    if (editingDraftGroupId === groupId) {
      resetDraftEditorState();
    }

    if (renamingDraftGroupId === groupId) {
      closeRenameDraftGroupModal();
    }

    if (showDraftGroupRuleModal && selectedDraftGroupId === groupId) {
      setShowDraftGroupRuleModal(false);
      setDraftGroupRuleSelection(null);
    }
  }

  function clearDraft() {
    resetDraftState();
  }

  function openRenameDraftGroupModal(groupId: string, currentName: string) {
    setRenamingDraftGroupId(groupId);
    setRenameDraftGroupValue(currentName);
    setShowRenameDraftGroupModal(true);
  }

  function closeRenameDraftGroupModal() {
    setShowRenameDraftGroupModal(false);
    setRenamingDraftGroupId(null);
    setRenameDraftGroupValue("");
  }

  function saveRenameDraftGroup() {
    const name = renameDraftGroupValue.trim();
    if (!renamingDraftGroupId || !name) return;

    setDraftGroups((prev) =>
      prev.map((g) => (g.id === renamingDraftGroupId ? { ...g, name } : g)),
    );

    closeRenameDraftGroupModal();
  }

  function openDraftEditor(groupId: string, index: number) {
    const group = draftGroups.find((g) => g.id === groupId);
    const d = group?.dice[index];
    if (!group || !d) return;

    setEditingDraftGroupId(groupId);
    setEditingDraftIndex(index);
    setDraftEditModifier(String(d.modifier ?? 0));
    setDraftEditSign(String(d.sign ?? 1) as "1" | "-1");
    setDraftEditRuleId(d.rule_id ?? null);
    setDraftEditSides(String(d.sides));
    setDraftEditQty(String(d.qty));
  }

  function saveDraftEditor() {
    if (editingDraftGroupId == null || editingDraftIndex == null) return;

    const sides = Number(draftEditSides || "0");
    const qty = Number(draftEditQty || "0");
    const modifier = Number(draftEditModifier || "0");
    const sign = Number(draftEditSign || "1");

    if (!Number.isFinite(sides) || sides <= 0) return;
    if (!Number.isFinite(qty) || qty <= 0) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === editingDraftGroupId
          ? {
            ...group,
            dice: group.dice.map((d, i) =>
              i === editingDraftIndex
                ? {
                  ...d,
                  sides,
                  qty,
                  modifier: Number.isFinite(modifier) ? modifier : 0,
                  sign: sign === -1 ? -1 : 1,
                  rule_id: draftEditRuleId ?? null,
                }
                : d,
            ),
          }
          : group,
      ),
    );

    resetDraftEditorState();
    setDraftResults([]);
  }

  function openDraftGroupRuleEditor(groupId: string) {
    const group = draftGroups.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedDraftGroupId(groupId);
    setDraftGroupRuleSelection(group.rule_id ?? null);
    setShowDraftGroupRuleModal(true);
  }

  function saveDraftGroupRuleEditor() {
    if (!selectedDraftGroupId) return;

    setDraftGroups((prev) =>
      prev.map((group) =>
        group.id === selectedDraftGroupId
          ? { ...group, rule_id: draftGroupRuleSelection ?? null }
          : group,
      ),
    );

    setShowDraftGroupRuleModal(false);
    setDraftResults([]);
  }

  function closeDraftGroupRuleModal() {
    setShowDraftGroupRuleModal(false);
    setDraftGroupRuleSelection(null);
  }

  async function rollDraft() {
    const nonEmptyGroups = getNonEmptyDraftGroups();

    if (nonEmptyGroups.length === 0) return;

    const rolled = nonEmptyGroups.map((group) => {
      const groupRule = group.rule_temp
        ? group.rule_temp
        : group.rule_id
          ? (availableRules.find((r) => r.id === group.rule_id) ?? null)
          : null;

      return rollGroup({
        groupId: group.id,
        label: group.name,
        entries: group.dice.map((d, idx) => {
          const rule = d.rule_temp
            ? d.rule_temp
            : d.rule_id
              ? (availableRules.find((r) => r.id === d.rule_id) ?? null)
              : null;

          return {
            entryId: `${group.id}-draft-${idx}`,
            sides: d.sides,
            qty: d.qty,
            modifier: d.modifier ?? 0,
            sign: d.sign ?? 1,
            rule: rule
              ? {
                id: rule.id,
                name: rule.name,
                kind: rule.kind,
                params_json: rule.params_json,
              }
              : null,
          };
        }),
        groupRule: groupRule
          ? {
            id: groupRule.id,
            name: groupRule.name,
            kind: groupRule.kind,
            params_json: groupRule.params_json,
          }
          : null,
        evaluateRule,
      });
    });

    setDraftResults(rolled);

    if (!table) {
      return;
    }

    try {
      const eventId = await newId();
      const createdAt = nowIso();

      const payload = {
        type: "draft_multi_groups",
        tableId: table.id,
        tableName: table.name,
        groups: rolled,
      };

      const summary = {
        title: `Jet rapide — ${table.name}`,
        lines: rolled.map((r) => `${r.label}: total ${r.total}`),
      };

      await insertRollEvent(db, {
        id: eventId,
        table_id: table.id,
        created_at: createdAt,
        payload_json: JSON.stringify(payload),
        summary_json: JSON.stringify(summary),
      });
    } catch (e) {
      console.warn("insertRollEvent (draft multi-groups) failed", e);
    }
  }

  function applyTempRuleToSelectedGroup(rule: DraftTempRule | null) {
    setDraftGroups((prev) => {
      if (prev.length === 0) return prev;

      const targetGroupId = selectedDraftGroupId ?? prev[0].id;

      return prev.map((group) =>
        group.id === targetGroupId
          ? {
            ...group,
            rule_temp: rule,
          }
          : group,
      );
    });

    setDraftResults([]);
  }

  function clearTempRuleFromSelectedGroup() {
    setDraftGroups((prev) => {
      if (prev.length === 0) return prev;

      const targetGroupId = selectedDraftGroupId ?? prev[0].id;

      return prev.map((group) =>
        group.id === targetGroupId
          ? {
            ...group,
            rule_temp: null,
          }
          : group,
      );
    });

    setDraftResults([]);
  }

  return {
    draftGroups,
    setDraftGroups,
    draftResults,
    setDraftResults,
    selectedDraftGroupId,
    setSelectedDraftGroupId,

    showRenameDraftGroupModal,
    renamingDraftGroupId,
    renameDraftGroupValue,
    setRenameDraftGroupValue,

    showDraftGroupRuleModal,
    closeDraftGroupRuleModal,
    draftGroupRuleSelection,
    setDraftGroupRuleSelection,

    editingDraftGroupId,
    editingDraftIndex,
    draftEditModifier,
    setDraftEditModifier,
    draftEditSign,
    setDraftEditSign,
    draftEditRuleId,
    setDraftEditRuleId,
    draftEditSides,
    setDraftEditSides,
    draftEditQty,
    setDraftEditQty,

    resetDraftEditorState,
    resetDraftState,
    getNonEmptyDraftGroups,

    addDraftGroup,
    addDieToDraft,
    addQuickStandardDie,
    addQuickPresetDie,
    removeDraftDie,
    updateDraftDieQty,
    updateDraftDieEntry,
    replaceDraftDieWithQtySplit,
    removeDraftGroup,
    clearDraft,

    openRenameDraftGroupModal,
    closeRenameDraftGroupModal,
    saveRenameDraftGroup,

    openDraftEditor,
    saveDraftEditor,

    openDraftGroupRuleEditor,
    saveDraftGroupRuleEditor,

    rollDraft,
    applyTempRuleToSides,
    clearTempRuleFromSides,
    clearAllTempRules,

    applyTempRuleToSelectedGroup,
    clearTempRuleFromSelectedGroup,
  };
}
