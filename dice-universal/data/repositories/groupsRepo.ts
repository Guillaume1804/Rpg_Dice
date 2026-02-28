import type { Db } from "../db/database";

export type GroupRow = {
  id: string;
  table_id: string;
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

  rule_mode: string;
  rule_params_json: string;

  created_at: string;
  updated_at: string;
};

export async function listGroupsByTableId(db: Db, tableId: string): Promise<GroupRow[]> {
  return db.getAllAsync<GroupRow>(
    "SELECT * FROM groups WHERE table_id = ? ORDER BY sort_order ASC;",
    [tableId]
  );
}

export async function listDiceByGroupId(db: Db, groupId: string): Promise<GroupDieRow[]> {
  return db.getAllAsync<GroupDieRow>(
    "SELECT * FROM group_dice WHERE group_id = ? ORDER BY sort_order ASC;",
    [groupId]
  );
}