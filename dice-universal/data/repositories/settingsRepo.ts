import type { Db } from "../db/database";
import { getMeta, setMeta } from "../db/database";

export type AppSettings = {
  animationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
};

const SETTINGS_META_KEY = "app_settings_v1";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  animationsEnabled: true,
  hapticsEnabled: true,
  soundsEnabled: false,
};

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
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

    hapticsEnabled: isBoolean(raw.hapticsEnabled)
      ? raw.hapticsEnabled
      : DEFAULT_APP_SETTINGS.hapticsEnabled,

    soundsEnabled: isBoolean(raw.soundsEnabled)
      ? raw.soundsEnabled
      : DEFAULT_APP_SETTINGS.soundsEnabled,
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
  await setMeta(db, SETTINGS_META_KEY, JSON.stringify(settings));
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
