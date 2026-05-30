'use client';

import {useEffect} from 'react';
import {useContainer} from '@videojs/react';

// Maps physical key code → the English key the coordinator expects.
// Arrow/Space/digit keys produce the same event.key on all layouts — no remapping needed.
const CODE_TO_ENGLISH_KEY: Record<string, string> = {
    KeyK: 'k',
    KeyM: 'm',
    KeyF: 'f',
    KeyC: 'c',
    KeyI: 'i',
    KeyL: 'l',
    KeyJ: 'j',
};

export function LayoutIndependentHotkeys() {
    const container = useContainer();

    useEffect(() => {
        if (!container) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const englishKey = CODE_TO_ENGLISH_KEY[event.code];
            if (!englishKey) return;

            // English layout — coordinator already handles it.
            if (event.key.toLowerCase() === englishKey) return;

            // Stop the mismatched event so the coordinator ignores it.
            event.stopImmediatePropagation();
            event.preventDefault();

            // Re-dispatch with the correct English key so the coordinator
            // processes it normally — including status notifications.
            event.target?.dispatchEvent(new KeyboardEvent('keydown', {
                key: englishKey,
                code: event.code,
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                repeat: event.repeat,
                bubbles: true,
                cancelable: true,
            }));
        };

        container.addEventListener('keydown', handleKeyDown, {capture: true});
        return () => container.removeEventListener('keydown', handleKeyDown, {capture: true});
    }, [container]);

    return null;
}
