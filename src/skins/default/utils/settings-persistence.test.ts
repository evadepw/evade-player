import {describe, it, expect, beforeEach} from 'vitest';
import {setupLocalStorageMock} from '../../../test-utils/localStorage-mock';
import {savePlayerSettings, loadPlayerSettings, clearPlayerSettings} from './settings-persistence';
import {DEFAULT_SUBTITLE_APPEARANCE, DEFAULT_FRAGMENT_SETTINGS} from '../types';

const BASE_SETTINGS = {
    volume: 0.8,
    muted: false,
    playbackRate: 1,
    subtitleAppearance: DEFAULT_SUBTITLE_APPEARANCE,
    volumeBoost: '100',
    normalization: 'off',
    fragmentSettings: DEFAULT_FRAGMENT_SETTINGS,
};

setupLocalStorageMock();

beforeEach(() => {
    localStorage.clear();
});

describe('savePlayerSettings / loadPlayerSettings', () => {
    it('round-trips a full settings object', () => {
        savePlayerSettings(BASE_SETTINGS);
        expect(loadPlayerSettings()).toEqual(BASE_SETTINGS);
    });

    it('merges partial updates into existing settings', () => {
        savePlayerSettings(BASE_SETTINGS);
        savePlayerSettings({volume: 0.5});
        const loaded = loadPlayerSettings();
        expect(loaded?.volume).toBe(0.5);
        expect(loaded?.muted).toBe(false);
        expect(loaded?.playbackRate).toBe(1);
    });

    it('saves from scratch with a partial object', () => {
        savePlayerSettings({volume: 0.3, muted: true});
        const loaded = loadPlayerSettings();
        expect(loaded?.volume).toBe(0.3);
        expect(loaded?.muted).toBe(true);
    });

    it('last write wins for the same key', () => {
        savePlayerSettings({volume: 0.8});
        savePlayerSettings({volume: 0.2});
        expect(loadPlayerSettings()?.volume).toBe(0.2);
    });
});

describe('loadPlayerSettings', () => {
    it('returns null when nothing has been saved', () => {
        expect(loadPlayerSettings()).toBeNull();
    });

    it('returns null for corrupted JSON', () => {
        localStorage.setItem('evade-player:settings', '{bad json}');
        expect(loadPlayerSettings()).toBeNull();
    });
});

describe('clearPlayerSettings', () => {
    it('removes stored settings', () => {
        savePlayerSettings(BASE_SETTINGS);
        clearPlayerSettings();
        expect(loadPlayerSettings()).toBeNull();
    });

    it('is a no-op when nothing was saved', () => {
        expect(() => clearPlayerSettings()).not.toThrow();
    });
});
