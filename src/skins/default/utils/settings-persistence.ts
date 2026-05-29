import type {PlayerSettings} from '../types';

const STORAGE_KEY = 'evade-player:settings';

export function savePlayerSettings(settings: Partial<PlayerSettings>): void {
    try {
        const existing = loadPlayerSettings() ?? {} as PlayerSettings;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({...existing, ...settings}));
    } catch { /* localStorage may be unavailable */ }
}

export function loadPlayerSettings(): PlayerSettings | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PlayerSettings;
    } catch { /* localStorage may be unavailable */
        return null;
    }
}

export function clearPlayerSettings(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { /* localStorage may be unavailable */ }
}
