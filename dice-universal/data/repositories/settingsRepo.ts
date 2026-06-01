// dice-universal/data/repositories/settingsRepo.ts

import type { Db } from "../db/database";
import { getMeta, setMeta } from "../db/database";

export type AppSettings = {
  /**
   * Ancien réglage global conservé pour compatibilité.
   * À terme, reduceMotion deviendra plus précis.
   */
  animationsEnabled: boolean;

  /**
   * Réduit les animations non essentielles.
   * Futur usage : transitions plus courtes ou instantanées.
   */
  reduceMotion: boolean;

  /**
   * Désactive les flashs ou effets lumineux agressifs.
   * Futur usage : critiques, explosions, skins premium.
   */
  disableFlashes: boolean;

  /**
   * Limite les effets coûteux visuellement/performance.
   * Futur usage : halos, particules, cinématiques, skins lourds.
   */
  batterySaver: boolean;

  /**
   * Mode visuel plus calme et plus discret.
   * Ce n’est pas la même chose que reduceMotion.
   */
  soberMode: boolean;

  /**
   * Retours haptiques.
   */
  hapticsEnabled: boolean;

  /**
   * Sons de l’application.
   * Important : désactivé par défaut.
   */
  soundsEnabled: boolean;

  /**
   * Thème premium sélectionné.
   */
  selectedThemeId: string;

  /**
   * Skin de dés sélectionné.
   */
  selectedDiceSkinId: string;
};

const SETTINGS_META_KEY = "app_settings_v1";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  animationsEnabled: true,

  reduceMotion: false,
  disableFlashes: false,
  batterySaver: false,
  soberMode: false,

  hapticsEnabled: true,
  soundsEnabled: false,

  selectedThemeId: "graphite_astral",
  selectedDiceSkinId: "default_2d",
};

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_APP_SETTINGS;
  }

  const raw = value as Partial<AppSettings>;

  return {
    animationsEnabled: isBoolean(raw.animationsEnabled)
      ? raw.animationsEnabled
      : DEFAULT_APP_SETTINGS.animationsEnabled,

    reduceMotion: isBoolean(raw.reduceMotion)
      ? raw.reduceMotion
      : DEFAULT_APP_SETTINGS.reduceMotion,

    disableFlashes: isBoolean(raw.disableFlashes)
      ? raw.disableFlashes
      : DEFAULT_APP_SETTINGS.disableFlashes,

    batterySaver: isBoolean(raw.batterySaver)
      ? raw.batterySaver
      : DEFAULT_APP_SETTINGS.batterySaver,

    soberMode: isBoolean(raw.soberMode)
      ? raw.soberMode
      : DEFAULT_APP_SETTINGS.soberMode,

    hapticsEnabled: isBoolean(raw.hapticsEnabled)
      ? raw.hapticsEnabled
      : DEFAULT_APP_SETTINGS.hapticsEnabled,

    soundsEnabled: isBoolean(raw.soundsEnabled)
      ? raw.soundsEnabled
      : DEFAULT_APP_SETTINGS.soundsEnabled,

    selectedThemeId: isNonEmptyString(raw.selectedThemeId)
      ? raw.selectedThemeId
      : DEFAULT_APP_SETTINGS.selectedThemeId,

    selectedDiceSkinId: isNonEmptyString(raw.selectedDiceSkinId)
      ? raw.selectedDiceSkinId
      : DEFAULT_APP_SETTINGS.selectedDiceSkinId,
  };
}

export async function getAppSettings(db: Db): Promise<AppSettings> {
  const stored = await getMeta(db, SETTINGS_META_KEY);

  if (!stored) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    return normalizeSettings(JSON.parse(stored));
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(
  db: Db,
  settings: AppSettings,
): Promise<void> {
  await setMeta(db, SETTINGS_META_KEY, JSON.stringify(normalizeSettings(settings)));
}

export async function updateAppSettings(
  db: Db,
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await getAppSettings(db);
  const next = normalizeSettings({
    ...current,
    ...patch,
  });

  await saveAppSettings(db, next);

  return next;
}

export async function resetAppSettings(db: Db): Promise<AppSettings> {
  await saveAppSettings(db, DEFAULT_APP_SETTINGS);
  return DEFAULT_APP_SETTINGS;
}