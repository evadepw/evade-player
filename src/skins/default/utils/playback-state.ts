import type {PlaybackState} from '../types';

const STORAGE_PREFIX = 'evade-player:state:';

export function savePlaybackState(src: string, state: PlaybackState): void {
    try {
        const key = STORAGE_PREFIX + encodeURIComponent(src);
        localStorage.setItem(key, JSON.stringify(state));
    } catch { /* localStorage may be unavailable */ }
}

export function loadPlaybackState(src: string): PlaybackState | null {
    try {
        const key = STORAGE_PREFIX + encodeURIComponent(src);
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return {
            time: typeof data.time === 'number' ? data.time : 0,
            season: data.season,
            episode: data.episode,
            voiceover: data.voiceover,
        };
    } catch { /* localStorage may be unavailable */
        return null;
    }
}

export function clearPlaybackState(src: string): void {
    try {
        const key = STORAGE_PREFIX + encodeURIComponent(src);
        localStorage.removeItem(key);
    } catch { /* localStorage may be unavailable */ }
}
