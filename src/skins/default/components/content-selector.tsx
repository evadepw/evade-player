'use client';

import {useMemo, type ReactNode} from 'react';
import {Menu, Controls, Tooltip} from '@videojs/react';
import {Check, ChevronDown} from 'lucide-react';
import type {EpisodeOption, SeasonOption, VoiceoverOption} from '../types';
import {Button} from './button';
import {useLocaleStrings} from './locale-context';

export interface ContentSelectorProps {
    seasons?: SeasonOption[];
    currentSeason?: string;
    currentEpisode?: string;
    currentVoiceover?: string;
    onSeasonChange?: (value: string) => void;
    onEpisodeChange?: (value: string) => void;
    onVoiceoverChange?: (value: string) => void;
}

function Selector({
    options,
    currentValue,
    onChange,
    placeholder,
}: {
    options: {value: string; label: string}[];
    currentValue?: string;
    onChange: (value: string) => void;
    placeholder: string;
}): ReactNode {
    const current = options.find((o) => o.value === currentValue) ?? options[0];

    return (
        <Menu.Root side="bottom" align="start">
            <Menu.Trigger
                render={<Button/>}
                aria-label={placeholder}
            >
                <span>{current?.label ?? placeholder}</span>
                <ChevronDown className="media-icon"/>
            </Menu.Trigger>
            <Menu.Content className="media-surface media-popover media-menu">
                <Menu.RadioGroup value={currentValue ?? ''} onValueChange={onChange} label={placeholder}>
                    {options.map((option) => (
                        <Menu.RadioItem key={option.value} className="media-menu__item" value={option.value}>
                            <span>{option.label}</span>
                            <Menu.ItemIndicator checked={option.value === currentValue} forceMount className="media-menu__indicator">
                                <Check className="media-icon"/>
                            </Menu.ItemIndicator>
                        </Menu.RadioItem>
                    ))}
                </Menu.RadioGroup>
            </Menu.Content>
        </Menu.Root>
    );
}

function findVoiceoverInEpisode(
    episode: EpisodeOption,
    voiceoverValue: string
): VoiceoverOption | undefined {
    return episode.voiceovers?.find((v) => v.value === voiceoverValue);
}

function getVoiceoverEpisodes(
    seasons: SeasonOption[] | undefined,
    currentSeason: string | undefined,
    currentVoiceover: string | undefined
): EpisodeOption[] | undefined {
    if (!seasons || !currentSeason || !currentVoiceover) return undefined;

    const season = seasons.find((s) => s.value === currentSeason);
    if (!season) return undefined;

    // First, check if any episode's voiceover has its own episode list
    for (const ep of season.episodes ?? []) {
        const vo = findVoiceoverInEpisode(ep, currentVoiceover);
        if (vo?.episodes && vo.episodes.length > 0) {
            return vo.episodes;
        }
    }

    // Fallback: return all season episodes that have this voiceover
    const filtered = (season.episodes ?? []).filter((ep) =>
        ep.voiceovers?.some((v) => v.value === currentVoiceover)
    );
    return filtered.length > 0 ? filtered : undefined;
}

export function ContentSelector({
    seasons,
    currentSeason,
    currentEpisode,
    currentVoiceover,
    onSeasonChange,
    onEpisodeChange,
    onVoiceoverChange,
}: ContentSelectorProps): ReactNode | null {
    const t = useLocaleStrings();
    const currentSeasonData = useMemo(
        () => seasons?.find((s) => s.value === currentSeason),
        [seasons, currentSeason]
    );

    const seasonEpisodes = currentSeasonData?.episodes;

    const voiceoverEpisodes = useMemo(
        () => getVoiceoverEpisodes(seasons, currentSeason, currentVoiceover),
        [seasons, currentSeason, currentVoiceover]
    );

    // Use voiceover-filtered episodes if available, otherwise all season episodes
    const episodes = voiceoverEpisodes ?? seasonEpisodes;

    const currentEpisodeData = useMemo(
        () => episodes?.find((e) => e.value === currentEpisode),
        [episodes, currentEpisode]
    );

    // Voiceovers: from the current episode, or from the voiceover-filtered list
    const voiceovers = useMemo(() => {
        if (voiceoverEpisodes && currentSeasonData) {
            for (const ep of currentSeasonData.episodes ?? []) {
                const vos = ep.voiceovers;
                if (vos && vos.length > 0) return vos;
            }
        }
        return currentEpisodeData?.voiceovers;
    }, [voiceoverEpisodes, currentEpisodeData, currentSeasonData]);

    if (!seasons) return null;

    return (
        <Controls.Root className="media-content-container">
            <Controls.Group className="media-surface media-content-controls">
                <Tooltip.Provider>
                    {seasons && onSeasonChange && (
                        <Selector options={seasons} currentValue={currentSeason} onChange={onSeasonChange} placeholder={t.selectorSeason}/>
                    )}
                    {episodes && episodes.length > 0 && onEpisodeChange && (
                        <Selector options={episodes} currentValue={currentEpisode} onChange={onEpisodeChange} placeholder={t.selectorEpisode}/>
                    )}
                    {voiceovers && onVoiceoverChange && (
                        <Selector options={voiceovers} currentValue={currentVoiceover} onChange={onVoiceoverChange} placeholder={t.selectorVoiceover}/>
                    )}
                </Tooltip.Provider>
            </Controls.Group>
        </Controls.Root>

    );
}
