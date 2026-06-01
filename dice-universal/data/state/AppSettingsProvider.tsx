// dice-universal/data/state/AppSettingsProvider.tsx

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDb } from "../db/DbProvider";
import {
    DEFAULT_APP_SETTINGS,
    getAppSettings,
    resetAppSettings,
    updateAppSettings,
    type AppSettings,
} from "../repositories/settingsRepo";

type AppSettingsContextValue = {
    settings: AppSettings;
    loading: boolean;
    updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
    resetSettings: () => Promise<AppSettings>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const db = useDb();

    const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        void (async () => {
            try {
                const storedSettings = await getAppSettings(db);

                if (mounted) {
                    setSettings(storedSettings);
                }
            } catch {
                if (mounted) {
                    setSettings(DEFAULT_APP_SETTINGS);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [db]);

    const updateSettings = useCallback(
        async (patch: Partial<AppSettings>) => {
            const nextSettings = await updateAppSettings(db, patch);
            setSettings(nextSettings);
            return nextSettings;
        },
        [db],
    );

    const resetSettings = useCallback(async () => {
        const nextSettings = await resetAppSettings(db);
        setSettings(nextSettings);
        return nextSettings;
    }, [db]);

    const value = useMemo(
        () => ({
            settings,
            loading,
            updateSettings,
            resetSettings,
        }),
        [settings, loading, updateSettings, resetSettings],
    );

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);

    if (!context) {
        throw new Error("useAppSettings must be used within AppSettingsProvider");
    }

    return context;
}