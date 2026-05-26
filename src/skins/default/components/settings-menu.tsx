import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Menu, useMedia, usePlayer} from '@videojs/react';
import {Captions, Check, ChevronLeft, Gauge, Settings, Timer} from 'lucide-react';
import {Button} from './button';
import {AUTO_QUALITY_VALUE, SUBTITLES_OFF_VALUE, type QualityOption, type SettingsView} from '../types';
import {
    buildQualityMenuOptions,
    getActiveSubtitleValue,
    getQualityOptions,
    getSubtitleOptions,
    getSubtitleTrackValue,
    isHlsSource,
    parseHlsMasterPlaylist,
    resolveActiveQualityValue
} from '../utils';

function isMenuActionKey(key: string): boolean {
    return key === 'Enter' || key === ' ';
}

export function SettingsMenu({qualities, masterSource}: { qualities?: QualityOption[]; masterSource: string }): ReactNode {
    const store = usePlayer() as unknown as {
        loadSource: (src: string) => string;
        seek: (time: number) => number;
        play: () => Promise<void>;
        setPlaybackRate: (rate: number) => void;
    };
    const media = useMedia() as HTMLMediaElement | null;
    const source = usePlayer((s) => (s as { source: string | null }).source);
    const currentTime = usePlayer((s) => (s as { currentTime: number }).currentTime);
    const paused = usePlayer((s) => (s as { paused: boolean }).paused);
    const playbackRate = usePlayer((s) => (s as { playbackRate: number }).playbackRate);
    const playbackRates = usePlayer((s) => (s as { playbackRates?: readonly number[] }).playbackRates ?? []);
    const [manifestQualities, setManifestQualities] = useState<QualityOption[]>([]);
    const [tracksVersion, setTracksVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        if (qualities && qualities.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setManifestQualities([]);
            return () => {
                cancelled = true;
            };
        }

        if (!isHlsSource(masterSource)) {
            setManifestQualities([]);
            return () => {
                cancelled = true;
            };
        }

        fetch(masterSource)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch playlist: ${response.status}`);
                }
                return response.text();
            })
            .then((text) => {
                if (cancelled) return;
                setManifestQualities(parseHlsMasterPlaylist(masterSource, text));
            })
            .catch(() => {
                if (cancelled) return;
                setManifestQualities([]);
            });

        return () => {
            cancelled = true;
        };
    }, [qualities, masterSource]);

    useEffect(() => {
        if (!media?.textTracks) return;
        const trackList = media.textTracks;
        const onChange = () => setTracksVersion((value) => value + 1);

        trackList.addEventListener('change', onChange);
        trackList.addEventListener('addtrack', onChange);
        trackList.addEventListener('removetrack', onChange);

        return () => {
            trackList.removeEventListener('change', onChange);
            trackList.removeEventListener('addtrack', onChange);
            trackList.removeEventListener('removetrack', onChange);
        };
    }, [media]);

    const baseOptions = useMemo(
        () => getQualityOptions(qualities && qualities.length > 0 ? qualities : manifestQualities, source),
        [qualities, manifestQualities, source]
    );
    const qualityOptions = useMemo(() => buildQualityMenuOptions(baseOptions, masterSource), [baseOptions, masterSource]);
    const subtitleOptions = useMemo(() => getSubtitleOptions(media), [media, tracksVersion]);
    const speedOptions = useMemo(
        () => playbackRates.map((rate) => ({value: String(rate), label: `${rate}x`, disabled: false})),
        [playbackRates]
    );
    const speedValue = String(playbackRate);
    const [view, setView] = useState<SettingsView>('root');

    if (qualityOptions.length < 2 && speedOptions.length < 2 && subtitleOptions.length < 2) return null;

    const qualityValue = resolveActiveQualityValue(qualityOptions, source, masterSource);
    const subtitleValue = getActiveSubtitleValue(media);

    async function onQualityChange(nextValue: string): Promise<void> {
        if (!nextValue || nextValue === qualityValue) return;

        const resumeTime = currentTime;
        const shouldResume = !paused;
        const targetSource = nextValue === AUTO_QUALITY_VALUE ? masterSource : qualityOptions.find((option) => option.value === nextValue)?.src;

        if (!targetSource) return;

        store.loadSource(targetSource);

        if (Number.isFinite(resumeTime) && resumeTime > 0) {
            store.seek(resumeTime);
        }

        if (shouldResume) {
            try {
                await store.play();
            } catch {
                // ignore autoplay/playback errors after source switch
            }
        }
    }

    function onSubtitleChange(nextValue: string): void {
        if (!media?.textTracks) return;
        const isOff = nextValue === SUBTITLES_OFF_VALUE;

        Array.from(media.textTracks).forEach((track, index) => {
            if (track.kind !== 'subtitles' && track.kind !== 'captions') return;
            const optionValue = getSubtitleTrackValue(track, index);
            track.mode = !isOff && optionValue === nextValue ? 'showing' : 'disabled';
        });

        // Ensure menu/UI updates even if browser does not emit TextTrackList change immediately.
        setTracksVersion((value) => value + 1);
    }

    function onSpeedChange(nextValue: string): void {
        const nextRate = Number(nextValue);
        if (!Number.isFinite(nextRate) || nextRate <= 0) return;
        store.setPlaybackRate(nextRate);
    }

    function onOpenChange(open: boolean): void {
        if (open) {
            setView('root');
        }
    }

    return (
        <Menu.Root side="top" align="center" onOpenChange={onOpenChange}>
            <Menu.Trigger
                className="media-button--settings"
                render={<Button/>}
                aria-label="Settings"
            >
                <Settings className="media-icon"/>
            </Menu.Trigger>
            <Menu.Content className="media-surface media-popover media-menu media-menu--settings">
                {view === 'root' && (
                    <div className="media-menu__group">
                        {qualityOptions.length > 1 && (
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setView('quality')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setView('quality');
                                 }}>
                                <span className="media-settings__label">
                                    <Gauge className="media-icon"/>
                                    <span>Quality</span>
                                </span>
                                <span>{qualityOptions.find((option) => option.value === qualityValue)?.label ?? 'Auto'}</span>
                            </div>
                        )}
                        {subtitleOptions.length > 1 && (
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setView('subtitles')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setView('subtitles');
                                 }}>
                                <span className="media-settings__label">
                                    <Captions className="media-icon"/>
                                    <span>Subtitles</span>
                                </span>
                                <span>{subtitleOptions.find((option) => option.value === subtitleValue)?.label ?? 'Off'}</span>
                            </div>
                        )}
                        {speedOptions.length > 1 && (
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setView('speed')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setView('speed');
                                 }}>
                                <span className="media-settings__label">
                                    <Timer className="media-icon"/>
                                    <span>Speed</span>
                                </span>
                                <span>{speedValue}x</span>
                            </div>
                        )}
                    </div>
                )}
                {view === 'quality' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => setView('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 setView('root');
                             }}>
                            <span className="media-settings__label">
                                <ChevronLeft className="media-icon"/>
                                <span>Quality</span>
                            </span>
                        </div>
                        <Menu.RadioGroup className="media-menu__group" value={qualityValue} onValueChange={onQualityChange}
                                         label="Video quality">
                            {qualityOptions.map((option) => (
                                <Menu.RadioItem key={option.value} className="media-menu__item" value={option.value}>
                                    <span>{option.label}</span>
                                    <Menu.ItemIndicator checked={option.value === qualityValue} forceMount className="media-menu__indicator">
                                        <Check className="media-icon"/>
                                    </Menu.ItemIndicator>
                                </Menu.RadioItem>
                            ))}
                        </Menu.RadioGroup>
                    </div>
                )}
                {view === 'subtitles' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => setView('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 setView('root');
                             }}>
                            <span className="media-settings__label">
                                <ChevronLeft className="media-icon"/>
                                <span>Subtitles</span>
                            </span>
                        </div>
                        <Menu.RadioGroup className="media-menu__group" value={subtitleValue}
                                         onValueChange={onSubtitleChange} label="Subtitles">
                            {subtitleOptions.map((option) => (
                                <Menu.RadioItem key={option.value} className="media-menu__item" value={option.value}>
                                    <span>{option.label}</span>
                                    <Menu.ItemIndicator checked={option.value === subtitleValue} forceMount className="media-menu__indicator">
                                        <Check className="media-icon"/>
                                    </Menu.ItemIndicator>
                                </Menu.RadioItem>
                            ))}
                        </Menu.RadioGroup>
                    </div>
                )}
                {view === 'speed' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => setView('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 setView('root');
                             }}>
                            <span className="media-settings__label">
                                <ChevronLeft className="media-icon"/>
                                <span>Speed</span>
                            </span>
                        </div>
                        <Menu.RadioGroup className="media-menu__group" value={speedValue} onValueChange={onSpeedChange}
                                         label="Playback rate">
                            {speedOptions.map((option) => (
                                <Menu.RadioItem key={option.value} className="media-menu__item" value={option.value}
                                                disabled={option.disabled}>
                                    <span>{option.label}</span>
                                    <Menu.ItemIndicator checked={option.value === speedValue} forceMount className="media-menu__indicator">
                                        <Check className="media-icon"/>
                                    </Menu.ItemIndicator>
                                </Menu.RadioItem>
                            ))}
                        </Menu.RadioGroup>
                    </div>
                )}
            </Menu.Content>
        </Menu.Root>
    );
}
