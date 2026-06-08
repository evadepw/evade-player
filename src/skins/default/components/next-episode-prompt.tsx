'use client';

import {type ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {useMedia} from '@videojs/react';
import {SkipForward, X} from 'lucide-react';
import type {EpisodeOption, SeasonOption} from '../types';
import {useLocaleStrings} from './locale-context';

const AUTO_ADVANCE_SECONDS = 5;

interface NextEpisodeTarget {
    seasonValue: string;
    episode: EpisodeOption;
}

export interface NextEpisodePromptProps {
    seasons?: SeasonOption[];
    currentSeason?: string;
    currentEpisode?: string;
    currentVoiceover?: string;
    onSeasonChange?: (value: string) => void;
    onEpisodeChange?: (value: string) => void;
    onVoiceoverChange?: (value: string) => void;
}

function findVoiceoverEpisodes(
    season: SeasonOption,
    currentVoiceover: string | undefined
): EpisodeOption[] | undefined {
    if (!currentVoiceover) return undefined;

    for (const episode of season.episodes ?? []) {
        const voiceover = episode.voiceovers?.find((item) => item.value === currentVoiceover);
        if (voiceover?.episodes && voiceover.episodes.length > 0) {
            return voiceover.episodes;
        }
    }

    const filtered = (season.episodes ?? []).filter((episode) =>
        episode.voiceovers?.some((voiceover) => voiceover.value === currentVoiceover)
    );

    return filtered.length > 0 ? filtered : undefined;
}

function getPlayableEpisodes(
    seasons: SeasonOption[] | undefined,
    currentVoiceover: string | undefined
): NextEpisodeTarget[] {
    if (!seasons) return [];

    return seasons.flatMap((season) => {
        const episodes = findVoiceoverEpisodes(season, currentVoiceover) ?? season.episodes ?? [];
        return episodes.map((episode) => ({seasonValue: season.value, episode}));
    });
}

function getNextEpisode(
    seasons: SeasonOption[] | undefined,
    currentSeason: string | undefined,
    currentEpisode: string | undefined,
    currentVoiceover: string | undefined
): NextEpisodeTarget | null {
    if (!currentEpisode) return null;

    const playableEpisodes = getPlayableEpisodes(seasons, currentVoiceover);
    const currentIndex = playableEpisodes.findIndex((item) =>
        item.episode.value === currentEpisode && (!currentSeason || item.seasonValue === currentSeason)
    );

    if (currentIndex < 0) return null;
    return playableEpisodes[currentIndex + 1] ?? null;
}

function getNextVoiceover(episode: EpisodeOption, currentVoiceover: string | undefined): string | undefined {
    if (!episode.voiceovers?.length) return currentVoiceover;
    if (currentVoiceover && episode.voiceovers.some((voiceover) => voiceover.value === currentVoiceover)) {
        return currentVoiceover;
    }
    return episode.voiceovers[0]?.value;
}

export function NextEpisodePrompt({
    seasons,
    currentSeason,
    currentEpisode,
    currentVoiceover,
    onSeasonChange,
    onEpisodeChange,
    onVoiceoverChange,
}: NextEpisodePromptProps): ReactNode | null {
    const t = useLocaleStrings();
    const media = useMedia() as HTMLMediaElement | null;
    const pendingAutoplayEpisodeRef = useRef<string | null>(null);
    const [visible, setVisible] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(AUTO_ADVANCE_SECONDS);

    const nextEpisode = useMemo(
        () => getNextEpisode(seasons, currentSeason, currentEpisode, currentVoiceover),
        [seasons, currentSeason, currentEpisode, currentVoiceover]
    );

    // Reset prompt state whenever the current playback context changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setVisible(false);
        setCancelled(false);
        setRemainingSeconds(AUTO_ADVANCE_SECONDS);
    }, [currentSeason, currentEpisode, currentVoiceover]);

    useEffect(() => {
        if (!media || !nextEpisode || !onEpisodeChange) return;

        const handleEnded = () => {
            if (cancelled) return;
            setVisible(true);
            setRemainingSeconds(AUTO_ADVANCE_SECONDS);
        };

        media.addEventListener('ended', handleEnded);
        return () => media.removeEventListener('ended', handleEnded);
    }, [media, nextEpisode, onEpisodeChange, cancelled]);

    const goToNextEpisode = () => {
        if (!nextEpisode || !onEpisodeChange) return;

        pendingAutoplayEpisodeRef.current = nextEpisode.episode.value;

        if (nextEpisode.seasonValue !== currentSeason) {
            onSeasonChange?.(nextEpisode.seasonValue);
        }

        const nextVoiceover = getNextVoiceover(nextEpisode.episode, currentVoiceover);
        if (nextVoiceover && nextVoiceover !== currentVoiceover) {
            onVoiceoverChange?.(nextVoiceover);
        }

        onEpisodeChange(nextEpisode.episode.value);
        setVisible(false);
    };

    useEffect(() => {
        if (!visible || !nextEpisode || !onEpisodeChange) return;

        const intervalId = window.setInterval(() => {
            setRemainingSeconds((value) => Math.max(0, value - 1));
        }, 1000);

        const timeoutId = window.setTimeout(goToNextEpisode, AUTO_ADVANCE_SECONDS * 1000);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
        // goToNextEpisode intentionally reads the latest props during the active prompt.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, nextEpisode, onEpisodeChange]);

    useEffect(() => {
        if (!media || !currentEpisode || pendingAutoplayEpisodeRef.current !== currentEpisode) return;

        pendingAutoplayEpisodeRef.current = null;
        window.requestAnimationFrame(() => {
            void media.play().catch(() => {
                // Browsers may block autoplay; the user can still start playback manually.
            });
        });
    }, [media, currentEpisode]);

    if (!visible || !nextEpisode || !onEpisodeChange) return null;

    return (
        <div className="media-next-episode-prompt">
            <div className="media-surface media-next-episode-prompt__dialog">
                <button
                    className="media-next-episode-prompt__close"
                    onClick={() => {
                        setCancelled(true);
                        setVisible(false);
                    }}
                    aria-label={t.nextEpisodeCancel}
                >
                    <X className="media-icon"/>
                </button>
                <div className="media-next-episode-prompt__content">
                    <p className="media-next-episode-prompt__label">{t.nextEpisodeUpNext}</p>
                    <p className="media-next-episode-prompt__title">{nextEpisode.episode.label}</p>
                    <p className="media-next-episode-prompt__countdown">
                        {t.nextEpisodeAutoplayIn.replace('{seconds}', String(remainingSeconds))}
                    </p>
                </div>
                <button className="media-button media-button--primary media-next-episode-prompt__action" onClick={goToNextEpisode}>
                    <SkipForward className="media-icon"/>
                    <span>{t.nextEpisodePlay}</span>
                </button>
            </div>
        </div>
    );
}
