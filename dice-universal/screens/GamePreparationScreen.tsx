// dice-universal/screens/GamePreparationScreen.tsx

/**
 * Écran Préparation du jeu.
 *
 * Cet écran réutilise temporairement RollScreen, car RollScreen contient encore
 * la logique importante de préparation :
 * - table active
 * - profil actif
 * - actions sauvegardées
 * - jet préparé
 * - édition des dés
 * - sauvegarde / mise à jour / variante
 * - configuration des comportements
 *
 * Le lancer principal et l’affichage final du résultat appartiennent désormais
 * à Roll3DScreen. Les fonctions de lancer encore présentes ici servent
 * temporairement de prévisualisation/test, et seront migrées progressivement
 * vers Roll3D.
 */
export { default } from "./RollScreen";
