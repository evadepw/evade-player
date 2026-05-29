'use client';

/* eslint-disable react-refresh/only-export-components */

import {createContext, useContext, useMemo, useState, type ReactNode} from 'react';
import {
    DEFAULT_FRAGMENT_SETTINGS,
    type FragmentSettings,
} from '../types';
import {loadPlayerSettings, savePlayerSettings} from '../utils/settings-persistence';

interface FragmentSettingsContextValue {
    settings: FragmentSettings;
    updateSettings: (update: FragmentSettings) => void;
}

const FragmentSettingsContext = createContext<FragmentSettingsContextValue | null>(null);

export function FragmentSettingsProvider({
    children,
    initialSettings: initialSettingsProp,
}: {
    children: ReactNode;
    initialSettings?: Partial<FragmentSettings>;
}): ReactNode {
    const [settings, setSettings] = useState<FragmentSettings>(() => {
        const persisted = loadPlayerSettings();
        return {
            ...DEFAULT_FRAGMENT_SETTINGS,
            ...persisted?.fragmentSettings,
            ...initialSettingsProp,
        };
    });

    const updateSettings = useMemo(() => (next: FragmentSettings) => {
        setSettings(next);
        savePlayerSettings({fragmentSettings: next});
    }, []);

    return (
        <FragmentSettingsContext.Provider value={{settings, updateSettings}}>
            {children}
        </FragmentSettingsContext.Provider>
    );
}

export function useFragmentSettings(): FragmentSettingsContextValue {
    const ctx = useContext(FragmentSettingsContext);
    if (!ctx) {
        return {settings: DEFAULT_FRAGMENT_SETTINGS, updateSettings: () => {}};
    }
    return ctx;
}
