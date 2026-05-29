import {useEffect} from 'react';
import {usePlayerContext} from '@videojs/react';
import {setMediaElement, resumeOnUserInteraction, getAudioChainDebugInfo} from './audio-chain';

const DEBUG = import.meta.env.DEV;

function log(...args: unknown[]): void {
    if (DEBUG) {
        console.log('[VolumeProcessor]', ...args);
    }
}

export function VolumeProcessor(): null {
    const {container} = usePlayerContext();

    useEffect(() => {
        log('useEffect: usePlayerContext container =', container);

        if (!container) {
            log('useEffect: no container yet, returning');
            return;
        }

        log('useEffect: container constructor.name =', container.constructor?.name);
        log('useEffect: container instanceof HTMLElement =', container instanceof HTMLElement);
        log('useEffect: innerHTML preview =', container.innerHTML?.slice(0, 300));

        const findAndAttachRealMediaElement = (): HTMLMediaElement | null => {
            if (!(container instanceof HTMLElement)) {
                log('findAndAttachRealMediaElement: container is not HTMLElement');
                return null;
            }

            const videoEl = container.querySelector('video');
            const audioEl = container.querySelector('audio');

            log('findAndAttachRealMediaElement: found video?', !!videoEl, 'found audio?', !!audioEl);

            const mediaEl = (videoEl || audioEl) as HTMLMediaElement | null;

            if (mediaEl) {
                log('findAndAttachRealMediaElement: found real media element! tagName =', mediaEl.tagName);
                log('  instanceof HTMLMediaElement:', mediaEl instanceof HTMLMediaElement);
                log('  src:', mediaEl.src?.slice(0, 80));
                setMediaElement(mediaEl);
            }

            return mediaEl;
        };

        let attachedMedia: HTMLMediaElement | null = null;
        let rafId: number | null = null;
        let observer: MutationObserver | null = null;

        const pollForMediaElement = (): void => {
            if (attachedMedia) return;

            const found = findAndAttachRealMediaElement();
            if (found) {
                attachedMedia = found;
                setupListeners(found);
                return;
            }

            log('pollForMediaElement: not found yet, will retry via RAF and MutationObserver');
            rafId = requestAnimationFrame(pollForMediaElement);
        };

        const setupListeners = (media: HTMLMediaElement): void => {
            log('setupListeners: adding listeners to real media element');

            const handlePlay = (): void => {
                log('media event: play - will try to resume audio context');
                resumeOnUserInteraction();

                if (DEBUG) {
                    setTimeout(() => {
                        const info = getAudioChainDebugInfo();
                        log('debug info after play resume:', info);
                    }, 100);
                }
            };

            const handleInteraction = (): void => {
                log('media event: user interaction - will try to resume audio context');
                resumeOnUserInteraction();
            };

            media.addEventListener('play', handlePlay);
            media.addEventListener('playing', handlePlay);
            media.addEventListener('click', handleInteraction);
            media.addEventListener('mousedown', handleInteraction);
        };

        pollForMediaElement();

        observer = new MutationObserver(() => {
            if (!attachedMedia) {
                findAndAttachRealMediaElement();
            }
        });

        if (container instanceof HTMLElement) {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }

        if (DEBUG) {
            (window as {dumpAudioChain?: () => void}).dumpAudioChain = () => {
                const info = getAudioChainDebugInfo();
                console.log('=== AudioChain Debug Info ===');
                console.log(JSON.stringify(info, null, 2));
                return info;
            };

            log('debug: call window.dumpAudioChain() in console to inspect audio chain state');
        }

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (observer) observer.disconnect();
        };
    }, [container]);

    return null;
}
