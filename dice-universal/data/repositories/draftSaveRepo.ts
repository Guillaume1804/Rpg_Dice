import type { Db } from "../db/database";
import { newId } from "../../core/types/ids";

export type DraftDie = { sides: number; qty: number; modifier?: number };

function nowIso() {
  return new Date().toISOString();
}

export async function deleteAllGroupsForProfile(db: Db, profileId: string): Promise<void> {
  // cascade -> group_dice supprimé automatiquement
  await db.runAsync("DELETE FROM groups WHERE profile_id = ?;", [profileId]);
}

export async function createGroupFromDraft(db: Db, params: {
  profileId: string;
  groupName: string;
  draftDice: DraftDie[];
}): Promise<string> {
  const createdAt = nowIso();
  const groupId = await newId();

  await db.runAsync(
    `INSERT INTO groups(id, profile_id, name, sort_order, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [groupId, params.profileId, params.groupName, 0, createdAt, createdAt]
  );

  let sort = 0;
  for (const d of params.draftDice) {
    const id = await newId();
    await db.runAsync(
      `INSERT INTO group_dice(id, group_id, sides, qty, modifier, sort_order, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
      [id, groupId, d.sides, d.qty, d.modifier ?? 0, sort++, createdAt, createdAt]
    );
  }

  return groupId;
}

export async function createProfileWithDraft(db: Db, params: {
  name: string;
  rulesetId: string;
  draftDice: DraftDie[];
  groupName: string;
}): Promise<string> {
  const createdAt = nowIso();
  const profileId = await newId();

  await db.runAsync(
    `INSERT INTO profiles(id, name, ruleset_id, is_system, created_at, updated_at)
     VALUES(?, ?, ?, ?, ?, ?);`,
    [profileId, params.name, params.rulesetId, 0, createdAt, createdAt]
  );

  await createGroupFromDraft(db, {
    profileId,
    groupName: params.groupName,
    draftDice: params.draftDice,
  });

  return profileId;
}