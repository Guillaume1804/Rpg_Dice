// dice-universal/features/roll3d/logic/roll3DHandoff.ts

import type { Roll3DDraft } from "../types";
import { createRoll3DId } from "./roll3DRandom";

export type Roll3DHandoffPayload = {
  id: string;
  label: string;
  createdAt: number;
  draft: Roll3DDraft;
};

const roll3DHandoffs = new Map<string, Roll3DHandoffPayload>();

export function createRoll3DHandoff(params: {
  label: string;
  draft: Roll3DDraft;
}) {
  const id = createRoll3DId("roll-3d-handoff");

  roll3DHandoffs.set(id, {
    id,
    label: params.label,
    createdAt: Date.now(),
    draft: params.draft,
  });

  return id;
}

export function consumeRoll3DHandoff(
  id: string | string[] | undefined,
): Roll3DHandoffPayload | null {
  const safeId = Array.isArray(id) ? id[0] : id;

  if (!safeId) {
    return null;
  }

  const payload = roll3DHandoffs.get(safeId) ?? null;

  if (payload) {
    roll3DHandoffs.delete(safeId);
  }

  return payload;
}
