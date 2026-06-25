// dice-universal/screens/GamePreparationScreen.tsx

import RollScreen from "./RollScreen";

/**
 * Écran officiel de Préparation du jeu.
 *
 * Cet écran est désormais le point d’entrée produit pour :
 * - table active ;
 * - profil actif ;
 * - actions / sets sauvegardés ;
 * - jet préparé ;
 * - édition des entrées de dés ;
 * - sauvegarde / mise à jour / variante ;
 * - configuration rapide des comportements ;
 * - envoi vers Roll3D.
 *
 * Important :
 * `RollScreen` reste utilisé comme implémentation temporaire, car il contient
 * encore la logique de préparation historique.
 *
 * La responsabilité finale de cet écran sera progressivement extraite ici,
 * tandis que `RollScreen` deviendra legacy ou sera supprimé après migration.
 *
 * Le lancer principal et l’affichage final premium du résultat appartiennent
 * à Roll3D.
 */
export default function GamePreparationScreen() {
  return <RollScreen />;
}