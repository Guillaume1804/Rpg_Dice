/**
 * Source unique de vérité pour les dimensions de la table Roll3D.
 *
 * Ces valeurs sont partagées par :
 * - le rendu Three.js ;
 * - la physique cannon-es ;
 * - les contraintes de déplacement tactiles ;
 * - les futurs outils de debug / Physics Lab.
 *
 * Important : ne plus redéclarer ces dimensions dans le renderer ou la physique.
 */
export const ROLL3D_TABLE = {
  surfaceY: -1.15,
  width: 5.8,
  depth: 8.4,
  wallHeight: 0.46,
  wallThickness: 0.12,
} as const;

/**
 * Marge utilisée pour empêcher le déplacement manuel d'amener le centre
 * d'un dé directement dans une paroi.
 *
 * Cette valeur relève de l'interaction utilisateur, pas du collider Cannon.
 */
export const ROLL3D_DRAG_TABLE_MARGIN = 0.46;
