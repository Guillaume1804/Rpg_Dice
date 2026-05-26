// dice-universal/theme/premium/usePremiumTheme.ts

import { GRAPHITE_ASTRAL_THEME } from "./themes";

export function usePremiumTheme() {
  return GRAPHITE_ASTRAL_THEME;
}

// Pour l’instant c’est volontairement simple. Plus tard, ce hook lira :
//
// selectedThemeId
// reduceMotion
// batterySaver
// soberMode
// 
// depuis les paramètres utilisateur.