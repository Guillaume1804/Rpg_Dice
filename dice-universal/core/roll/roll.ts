// core/roll/roll.ts

export type RollRuleRef = {
  id?: string;
  name?: string;
  kind: string;        // "sum" | "d20" | "pool" | "table_lookup" | etc
  params_json: string; // JSON string
};

export type RollEntryInput = {
  entryId: string;     // id de group_dice (ou "draft-1" etc)
  sides: number;
  qty: number;
  modifier: number;    // ex: +4
  sign: number;        // 1 ou -1
  rule?: RollRuleRef | null;
};

export type RollDieValue = {
  value: number;       // valeur brute (1..sides)
};

export type RollEntryResult = {
  entryId: string;
  sides: number;
  qty: number;

  modifier: number;
  sign: number;

  raw_values: number[];       // ex: [4, 6, 1]
  signed_values: number[];    // ex: [4, 6, 1] ou [-4, -6, -1]
  base_total: number;         // somme(signed_values)
  total_with_modifier: number;// base_total + modifier

  rule?: RollRuleRef | null;
  eval_result?: any | null;   // retour brut de evaluateRule
  final_total: number;        // total final de l’entrée (par défaut = total_with_modifier)
};

export type GroupRollResult = {
  groupId: string;
  label: string;
  entries: RollEntryResult[];
  total: number; // somme des final_total
};

function randIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollOneDie(sides: number): number {
  return randIntInclusive(1, Math.max(1, sides));
}

/**
 * IMPORTANT :
 * - rollGroup ne touche pas à la DB.
 * - si une rule est fournie, on applique evaluateRule (passée en param).
 * - sinon : final_total = somme(sign*valeurs) + modifier
 */
export function rollGroup(params: {
  groupId: string;
  label: string;
  entries: RollEntryInput[];

  // injection du moteur d’évaluation (pour garder roll.ts indépendant)
  evaluateRule?: (kind: string, params_json: string, ctx: { values: number[]; sides: number }) => any;
}): GroupRollResult {
  const entries: RollEntryResult[] = params.entries.map((e) => {
    const raw_values: number[] = [];
    for (let i = 0; i < Math.max(0, e.qty); i++) {
      raw_values.push(rollOneDie(e.sides));
    }

    const sign = e.sign === -1 ? -1 : 1;
    const signed_values = raw_values.map((v) => v * sign);

    const base_total = signed_values.reduce((a, b) => a + b, 0);
    const total_with_modifier = base_total + (Number.isFinite(e.modifier) ? e.modifier : 0);

    let eval_result: any | null = null;
    let final_total = total_with_modifier;

    if (e.rule && params.evaluateRule) {
      try {
        eval_result = params.evaluateRule(e.rule.kind, e.rule.params_json, {
          values: signed_values,
          sides: e.sides,
        });

        // Convention simple (MVP) :
        // - si l’éval renvoie un "total" numérique => on l’utilise
        // - sinon on garde total_with_modifier (et l’UI affichera le texte de résultat)
        if (eval_result && typeof eval_result.total === "number" && Number.isFinite(eval_result.total)) {
          final_total = eval_result.total + (Number.isFinite(e.modifier) ? e.modifier : 0);
        }
      } catch {
        // si la rule casse, on n’empêche pas le jet
        eval_result = { kind: "unknown", message: "Erreur évaluation règle" };
        final_total = total_with_modifier;
      }
    }

    return {
      entryId: e.entryId,
      sides: e.sides,
      qty: e.qty,
      modifier: e.modifier,
      sign,
      raw_values,
      signed_values,
      base_total,
      total_with_modifier,
      rule: e.rule ?? null,
      eval_result,
      final_total,
    };
  });

  const total = entries.reduce((acc, x) => acc + x.final_total, 0);

  return {
    groupId: params.groupId,
    label: params.label,
    entries,
    total,
  };
}