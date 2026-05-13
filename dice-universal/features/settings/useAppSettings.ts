import { useCallback, useEffect, useState } from "react";
import type { Db } from "../../data/db/database";
import {
  DEFAULT_APP_SETTINGS,
  getAppSettings,
  resetAppSettings,
  updateAppSettings,
  type AppSettings,
} from "../../data/repositories/settingsRepo";

type Params = {
  db: Db;
};

export function useAppSettings({ db }: Params) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const next = await getAppSettings(db);
      setSettings(next);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) {
    try {
      setError(null);

      const next = await updateAppSettings(db, {
        [key]: value,
      });

      setSettings(next);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  async function resetSettings() {
    try {
      setError(null);

      const next = await resetAppSettings(db);
      setSettings(next);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  return {
    settings,
    loading,
    error,
    reload: load,
    setSetting,
    resetSettings,
  };
}
