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

  /**
   * La bordure doit être suffisamment haute pour réellement contenir
   * les dés, notamment le d20 dont le diamètre visuel est proche de 0.74.
   *
   * Cette hauteur reste volontairement visible : aucune collision invisible
   * ne doit participer au lancer normal.
   */
  wallHeight: 0.95,

  /**
   * Une bordure légèrement plus épaisse donne également un contact physique
   * plus crédible lorsqu'un dé la frappe avec de la rotation.
   */
  wallThickness: 0.16,
} as const;

/**
 * Marge utilisée pour empêcher le déplacement manuel d'amener le centre
 * d'un dé directement dans une paroi.
 *
 * Cette valeur relève de l'interaction utilisateur, pas du collider Cannon.
 */
export const ROLL3D_DRAG_TABLE_MARGIN = 0.46;
