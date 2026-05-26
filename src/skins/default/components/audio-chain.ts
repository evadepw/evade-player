const DEBUG = true;

function log(...args: unknown[]): void {
    if (DEBUG) {
        console.log('[AudioChain]', ...args);
    }
}

let ctx: AudioContext | null = null;
let source: MediaElementAudioSourceNode | null = null;
let gainNode: GainNode | null = null;
let compressorNode: DynamicsCompressorNode | null = null;
let mediaElement: HTMLMediaElement | null = null;

let pendingVolumeFactor = 1;
let pendingNormalizationLevel = 'off';
let isInitialized = false;

const normalizationPresets: Record<string, { threshold: number; ratio: number; knee: number; attack: number; release: number }> = {
    off: { threshold: 0, ratio: 1, knee: 30, attack: 0.003, release: 0.25 },
    light: { threshold: -24, ratio: 2, knee: 30, attack: 0.003, release: 0.25 },
    medium: { threshold: -30, ratio: 4, knee: 20, attack: 0.003, release: 0.15 },
    strong: { threshold: -36, ratio: 8, knee: 10, attack: 0.003, release: 0.1 }
};

function applyPendingSettings(): void {
    if (!gainNode || !compressorNode) {
        log('applyPendingSettings: nodes not ready yet');
        return;
    }

    log('applyPendingSettings: volume=', pendingVolumeFactor, 'normalization=', pendingNormalizationLevel);

    gainNode.gain.value = Math.max(0, pendingVolumeFactor);

    const preset = normalizationPresets[pendingNormalizationLevel] || normalizationPresets.off;
    compressorNode.threshold.value = preset.threshold;
    compressorNode.ratio.value = preset.ratio;
    compressorNode.knee.value = preset.knee;
    compressorNode.attack.value = preset.attack;
    compressorNode.release.value = preset.release;
}

async function ensureAudioContextRunning(): Promise<boolean> {
    if (!ctx) {
        log('ensureAudioContextRunning: no context yet');
        return false;
    }

    log('ensureAudioContextRunning: context.state =', ctx.state);

    if (ctx.state === 'suspended') {
        try {
            log('ensureAudioContextRunning: attempting to resume...');
            await ctx.resume();
            log('ensureAudioContextRunning: resumed successfully, state =', ctx.state);
        } catch (e) {
            log('ensureAudioContextRunning: resume failed -', e);
            return false;
        }
    }

    return ctx.state === 'running';
}

function extractRealMediaElement(candidate: unknown): HTMLMediaElement | null {
    log('extractRealMediaElement: trying to extract from:', candidate);
    log('  typeof:', typeof candidate);
    log('  instanceof HTMLMediaElement:', candidate instanceof HTMLMediaElement);
    log('  instanceof HTMLElement:', candidate instanceof HTMLElement);
    log('  instanceof Object:', candidate instanceof Object);

    if (candidate === null || candidate === undefined) {
        log('extractRealMediaElement: is null/undefined');
        return null;
    }

    if (candidate instanceof HTMLMediaElement) {
        log('extractRealMediaElement: is direct HTMLMediaElement, tagName:', candidate.tagName);
        return candidate;
    }

    const obj = candidate as Record<string, unknown>;

    if (typeof obj === 'object') {
        log('extractRealMediaElement: keys:', Object.keys(obj));

        if (obj['current'] !== undefined) {
            log('extractRealMediaElement: has .current property:', obj['current']);
            if (obj['current'] instanceof HTMLMediaElement) {
                log('extractRealMediaElement: .current is HTMLMediaElement!');
                return obj['current'];
            }
        }

        if (obj['element'] !== undefined) {
            log('extractRealMediaElement: has .element property:', obj['element']);
            if (obj['element'] instanceof HTMLMediaElement) {
                log('extractRealMediaElement: .element is HTMLMediaElement!');
                return obj['element'];
            }
        }

        if (obj['nativeElement'] !== undefined) {
            log('extractRealMediaElement: has .nativeElement property:', obj['nativeElement']);
            if (obj['nativeElement'] instanceof HTMLMediaElement) {
                log('extractRealMediaElement: .nativeElement is HTMLMediaElement!');
                return obj['nativeElement'];
            }
        }

        if (obj['media'] !== undefined) {
            log('extractRealMediaElement: has .media property:', obj['media']);
            if (obj['media'] instanceof HTMLMediaElement) {
                log('extractRealMediaElement: .media is HTMLMediaElement!');
                return obj['media'];
            }
        }

        if (typeof obj['tagName'] === 'string') {
            log('extractRealMediaElement: has tagName:', obj['tagName']);
            if (obj instanceof Node && 'tagName' in obj) {
                log('extractRealMediaElement: is Node with tagName but instanceof check failed - probably Proxy');
                const maybeEl = candidate as HTMLElement;
                if (typeof maybeEl.addEventListener === 'function' &&
                    typeof maybeEl.play === 'function' &&
                    typeof maybeEl.pause === 'function') {
                    log('extractRealMediaElement: has play/pause methods - trying to use directly anyway');
                    return maybeEl as unknown as HTMLMediaElement;
                }
            }
        }

        try {
            const unwrapped = structuredClone ? null : null;
            log('extractRealMediaElement: structuredClone not usable for DOM elements');
        } catch {
            // ignore
        }
    }

    log('extractRealMediaElement: FAILED to extract HTMLMediaElement');
    return null;
}

function ensureAudioChain(): boolean {
    log('ensureAudioChain called, isInitialized=', isInitialized, 'hasMedia=', !!mediaElement);

    if (isInitialized) {
        log('ensureAudioChain: already initialized');
        void ensureAudioContextRunning();
        return true;
    }

    if (!mediaElement) {
        log('ensureAudioChain: no mediaElement set, call setMediaElement() first');
        return false;
    }

    log('ensureAudioChain: using mediaElement:', mediaElement.tagName, mediaElement);

    try {
        log('ensureAudioChain: creating new AudioContext...');
        ctx = new AudioContext();
        log('ensureAudioChain: created AudioContext, state =', ctx.state);

        log('ensureAudioChain: creating MediaElementSourceNode...');
        try {
            source = ctx.createMediaElementSource(mediaElement);
            log('ensureAudioChain: MediaElementSourceNode created successfully');
        } catch (e) {
            log('ensureAudioChain: FAILED createMediaElementSource -', e);
            log('ensureAudioChain: mediaElement constructor.name:', mediaElement.constructor?.name);
            log('ensureAudioChain: mediaElement.prototype chain:', Object.getPrototypeOf(mediaElement));
            throw e;
        }

        log('ensureAudioChain: creating DynamicsCompressorNode...');
        compressorNode = ctx.createDynamicsCompressor();

        log('ensureAudioChain: creating GainNode...');
        gainNode = ctx.createGain();

        source.connect(compressorNode);
        compressorNode.connect(gainNode);
        gainNode.connect(ctx.destination);

        log('ensureAudioChain: audio graph connected: source -> compressor -> gain -> destination');

        isInitialized = true;

        applyPendingSettings();

        void ensureAudioContextRunning();

        return true;
    } catch (e) {
        log('ensureAudioChain: TOP LEVEL ERROR -', e);
        if (ctx) {
            try { ctx.close(); } catch { /* ignore */ }
        }
        ctx = null;
        source = null;
        gainNode = null;
        compressorNode = null;
        return false;
    }
}

export function applyVolumeBoost(factor: number): void {
    log('applyVolumeBoost called with factor =', factor);

    pendingVolumeFactor = factor;

    if (!gainNode) {
        log('applyVolumeBoost: gainNode not ready, initializing chain...');
        const ok = ensureAudioChain();
        if (!ok) {
            log('applyVolumeBoost: ensureAudioChain failed, setting is stored as pending');
        }
        return;
    }

    gainNode.gain.value = Math.max(0, factor);
    log('applyVolumeBoost: gain set to', gainNode.gain.value);

    void ensureAudioContextRunning();
}

export function applyNormalization(level: string): void {
    log('applyNormalization called with level =', level);

    pendingNormalizationLevel = level;

    if (!compressorNode) {
        log('applyNormalization: compressorNode not ready, initializing chain...');
        const ok = ensureAudioChain();
        if (!ok) {
            log('applyNormalization: ensureAudioChain failed, setting is stored as pending');
        }
        return;
    }

    const preset = normalizationPresets[level] || normalizationPresets.off;

    compressorNode.threshold.value = preset.threshold;
    compressorNode.ratio.value = preset.ratio;
    compressorNode.knee.value = preset.knee;
    compressorNode.attack.value = preset.attack;
    compressorNode.release.value = preset.release;

    log('applyNormalization: compressor set - threshold:', preset.threshold, 'ratio:', preset.ratio, 'knee:', preset.knee);

    void ensureAudioContextRunning();
}

export function resumeOnUserInteraction(): void {
    log('resumeOnUserInteraction called');
    if (ensureAudioChain()) {
        void ensureAudioContextRunning();
    }
}

export function setMediaElement(element: unknown): void {
    log('setMediaElement called with:', element);

    const realElement = extractRealMediaElement(element);

    if (realElement) {
        log('setMediaElement: successfully extracted real HTMLMediaElement!');

        if (mediaElement && mediaElement !== realElement) {
            log('setMediaElement: different element detected - cannot reinitialize (createMediaElementSource limitation)');
        }

        if (!mediaElement) {
            mediaElement = realElement;
            log('setMediaElement: mediaElement set for the first time:', realElement.tagName);

            if (pendingVolumeFactor !== 1 || pendingNormalizationLevel !== 'off') {
                log('setMediaElement: have pending settings, will attempt to initialize chain');
                ensureAudioChain();
            }
        }
    } else {
        log('setMediaElement: WARNING - could NOT extract real HTMLMediaElement from:', element);
    }
}

export function getAudioChainDebugInfo(): {
    hasContext: boolean;
    contextState: string | null;
    hasSource: boolean;
    hasGain: boolean;
    hasCompressor: boolean;
    gainValue: number | null;
    compressorThreshold: number | null;
    compressorRatio: number | null;
    pendingVolume: number;
    pendingNormalization: string;
    isInitialized: boolean;
    hasMediaElement: boolean;
    mediaElementTagName: string | null;
} {
    return {
        hasContext: !!ctx,
        contextState: ctx?.state ?? null,
        hasSource: !!source,
        hasGain: !!gainNode,
        hasCompressor: !!compressorNode,
        gainValue: gainNode?.gain.value ?? null,
        compressorThreshold: compressorNode?.threshold.value ?? null,
        compressorRatio: compressorNode?.ratio.value ?? null,
        pendingVolume: pendingVolumeFactor,
        pendingNormalization: pendingNormalizationLevel,
        isInitialized,
        hasMediaElement: !!mediaElement,
        mediaElementTagName: mediaElement?.tagName ?? null
    };
}
