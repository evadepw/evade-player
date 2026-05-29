'use client';

import {type ComponentProps, forwardRef, useMemo, type ReactNode} from 'react';
import {Menu} from '@videojs/react';
import {Check, ChevronDown} from 'lucide-react';
import type {SeasonOption, VoiceoverOption} from '../types';

export interface ContentSelectorProps {
    seasons?: SeasonOption[];
    voiceovers?: VoiceoverOption[];
    currentSeason?: string;
    currentEpisode?: string;
    currentVoiceover?: string;
    onSeasonChange?: (value: string) => void;
    onEpisodeChange?: (value: string) => void;
    onVoiceoverChange?: (value: string) => void;
}

const SelectorTrigger = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
    function SelectorTrigger({className, children, ...props}, ref) {
        return (
            <button
                ref={ref}
                type="button"
                className={`media-button media-button--subtle media-selector-trigger ${className ?? ''}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

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
                className="media-selector-trigger"
                render={<SelectorTrigger/>}
                aria-label={placeholder}
            >
                <span className="media-selector-trigger__label">{current?.label ?? placeholder}</span>
                <ChevronDown className="media-icon media-selector-trigger__chevron"/>
            </Menu.Trigger>
            <Menu.Content className="media-surface media-popover media-menu">
                <Menu.RadioGroup value={currentValue ?? ''} onValueChange={onChange} label={placeholder}>
                    {options.map((option) => (
                        <Menu.RadioItem key={option.value} className="media-menu__item" value={option.value}>
                            <span>{option.label}</span>
                            <Menu.ItemIndicator checked={option.value === currentValue} forceMount
                                                className="media-menu__indicator">
                                <Check className="media-icon"/>
                            </Menu.ItemIndicator>
                        </Menu.RadioItem>
                    ))}
                </Menu.RadioGroup>
            </Menu.Content>
        </Menu.Root>
    );
}

export function ContentSelector({
    seasons,
    voiceovers,
    currentSeason,
    currentEpisode,
    currentVoiceover,
    onSeasonChange,
    onEpisodeChange,
    onVoiceoverChange,
}: ContentSelectorProps): ReactNode | null {
    const hasAny = seasons || voiceovers;
    if (!hasAny) return null;

    const currentSeasonData = useMemo(
        () => seasons?.find((s) => s.value === currentSeason),
        [seasons, currentSeason]
    );

    const episodes = currentSeasonData?.episodes;

    return (
        <div className="media-content-selector">
            {seasons && onSeasonChange && (
                <Selector options={seasons} currentValue={currentSeason} onChange={onSeasonChange}
                          placeholder="Season"/>
            )}
            {episodes && episodes.length > 0 && onEpisodeChange && (
                <Selector options={episodes} currentValue={currentEpisode} onChange={onEpisodeChange}
                          placeholder="Episode"/>
            )}
            {voiceovers && onVoiceoverChange && (
                <Selector options={voiceovers} currentValue={currentVoiceover} onChange={onVoiceoverChange}
                          placeholder="Voiceover"/>
            )}
        </div>
    );
}
