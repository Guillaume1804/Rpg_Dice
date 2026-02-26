import type { Db } from "../db/database";

export type GroupRow = {
  id: string;
  profile_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GroupDieRow = {
  id: string;
  group_id: string;
  sides: number;
  qty: number;
  modifier: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function listGroupsByProfileId(db: Db, profileId: string): Promise<GroupRow[]> {
  return db.getAllAsync<GroupRow>(
    "SELECT * FROM groups WHERE profile_id = ? ORDER BY sort_order ASC;",
    [profileId]
  );
}

export async function listDiceByGroupId(db: Db, groupId: string): Promise<GroupDieRow[]> {
  return db.getAllAsync<GroupDieRow>(
    "SELECT * FROM group_dice WHERE group_id = ? ORDER BY sort_order ASC;",
    [groupId]
  );
}