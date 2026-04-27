import { useState } from "react";

export function useQuickQtyModal({
  draftGroups,
  availableRules,
  adjustDraftDieQty,
  updateDraftDieEntry,
  replaceDraftDieWithQtySplit,
}: any) {
  const [visible, setVisible] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [qtyValue, setQtyValue] = useState("");
  const [modifierValue, setModifierValue] = useState("0");

  function open(
    groupId: string,
    index: number,
    currentQty: number,
    currentModifier: number,
  ) {
    setEditingGroupId(groupId);
    setEditingIndex(index);
    setQtyValue(String(currentQty));
    setModifierValue(String(currentModifier));
    setVisible(true);
  }

  function close() {
    setVisible(false);
    setEditingGroupId(null);
    setEditingIndex(null);
    setQtyValue("");
    setModifierValue("0");
  }

  function adjust(groupId: string, index: number, delta: number) {
    adjustDraftDieQty(groupId, index, delta);
  }

  function save() {
    if (editingGroupId == null || editingIndex == null) return;

    const qty = Number(qtyValue);
    const modifier = Number(modifierValue);

    if (!Number.isFinite(qty) || qty <= 0) return;
    if (!Number.isFinite(modifier)) return;

    const targetGroup = draftGroups.find(
      (group: any) => group.id === editingGroupId,
    );
    const targetDie = targetGroup?.dice[editingIndex];

    if (!targetDie) return;

    const resolvedRuleKind =
      targetDie.rule_temp?.kind ??
      (targetDie.rule_id
        ? (availableRules.find((rule: any) => rule.id === targetDie.rule_id)
            ?.kind ?? null)
        : null);

    const shouldSplit =
      resolvedRuleKind === "single_check" || resolvedRuleKind === "d20";

    if (shouldSplit) {
      replaceDraftDieWithQtySplit(editingGroupId, editingIndex, qty, modifier);
    } else {
      updateDraftDieEntry(editingGroupId, editingIndex, {
        qty,
        modifier,
      });
    }

    close();
  }

  return {
    visible,
    qtyValue,
    modifierValue,
    setQtyValue,
    setModifierValue,
    open,
    close,
    adjust,
    save,
  };
}
