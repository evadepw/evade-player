import {describe, it, expect, beforeEach} from 'vitest';
import {setupLocalStorageMock} from '../../../test-utils/localStorage-mock';
import {savePlaybackState, loadPlaybackState, clearPlaybackState} from './playback-state';

const SRC = 'https://cdn.example.com/video.mp4';

setupLocalStorageMock();

beforeEach(() => {
    localStorage.clear();
});

describe('savePlaybackState / loadPlaybackState', () => {
    it('round-trips a full state object', () => {
        const state = {time: 42.5, season: 's1', episode: 'e3', voiceover: 'rus'};
        savePlaybackState(SRC, state);
        expect(loadPlaybackState(SRC)).toEqual(state);
    });

    it('round-trips a minimal state (time only)', () => {
        savePlaybackState(SRC, {time: 10});
        const loaded = loadPlaybackState(SRC);
        expect(loaded?.time).toBe(10);
        expect(loaded?.season).toBeUndefined();
    });

    it('stores different sources independently', () => {
        const src2 = 'https://cdn.example.com/other.mp4';
        savePlaybackState(SRC, {time: 5});
        savePlaybackState(src2, {time: 99});
        expect(loadPlaybackState(SRC)?.time).toBe(5);
        expect(loadPlaybackState(src2)?.time).toBe(99);
    });

    it('overwrites existing state for the same source', () => {
        savePlaybackState(SRC, {time: 10});
        savePlaybackState(SRC, {time: 20});
        expect(loadPlaybackState(SRC)?.time).toBe(20);
    });

    it('URL-encodes the src key so special chars do not collide', () => {
        const srcWithQuery = 'https://cdn.example.com/v?id=1&tok=abc';
        const srcAlt = 'https://cdn.example.com/v?id=2&tok=abc';
        savePlaybackState(srcWithQuery, {time: 1});
        savePlaybackState(srcAlt, {time: 2});
        expect(loadPlaybackState(srcWithQuery)?.time).toBe(1);
        expect(loadPlaybackState(srcAlt)?.time).toBe(2);
    });
});

describe('loadPlaybackState', () => {
    it('returns null when nothing saved', () => {
        expect(loadPlaybackState(SRC)).toBeNull();
    });

    it('returns null for corrupted JSON', () => {
        localStorage.setItem('evade-player:state:' + encodeURIComponent(SRC), '{bad json}');
        expect(loadPlaybackState(SRC)).toBeNull();
    });

    it('coerces non-number time to 0', () => {
        localStorage.setItem(
            'evade-player:state:' + encodeURIComponent(SRC),
            JSON.stringify({time: 'oops', season: 's1'}),
        );
        expect(loadPlaybackState(SRC)?.time).toBe(0);
    });
});

describe('clearPlaybackState', () => {
    it('removes stored state', () => {
        savePlaybackState(SRC, {time: 30});
        clearPlaybackState(SRC);
        expect(loadPlaybackState(SRC)).toBeNull();
    });

    it('is a no-op when nothing was saved', () => {
        expect(() => clearPlaybackState(SRC)).not.toThrow();
    });
});
