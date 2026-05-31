import {vi} from 'vitest';

export function setupLocalStorageMock(): void {
    const store: Record<string, string> = {};

    const mock = {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
        get length() { return Object.keys(store).length; },
        key: (n: number) => Object.keys(store)[n] ?? null,
    };

    vi.stubGlobal('localStorage', mock);
}
