import {useEffect} from 'react';
import {usePlayerContext} from '@videojs/react';
import {setMediaElement, resumeOnUserInteraction, getAudioChainDebugInfo} from './audio-chain';

export function VolumeProcessor(): null {
    const {container} = usePlayerContext();

    useEffect(() => {

        if (!container) {
            return;
        }

        const findAndAttachRealMediaElement = (): HTMLMediaElement | null => {
            if (!(container instanceof HTMLElement)) {
                log('findAndAttachRealMediaElement: container is not HTMLElement');
                return null;
            }

            const videoEl = container.querySelector('video');
            const audioEl = container.querySelector('audio');

            const mediaEl = (videoEl || audioEl) as HTMLMediaElement | null;

            if (mediaEl) {
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

            rafId = requestAnimationFrame(pollForMediaElement);
        };

        const setupListeners = (media: HTMLMediaElement): void => {
            const handlePlay = (): void => {
                resumeOnUserInteraction();

                if (DEBUG) {
                    setTimeout(() => {
                        const info = getAudioChainDebugInfo();
                    }, 100);
                }
            };

            const handleInteraction = (): void => {
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

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (observer) observer.disconnect();
        };
    }, [container]);

    return null;
}
