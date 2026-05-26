import type {ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {Menu, useMedia, usePlayer} from '@videojs/react';
import {Captions, Check, ChevronLeft, Gauge, Palette, Settings, Timer, Volume2} from 'lucide-react';
import {Button} from './button';
import {
    AUTO_QUALITY_VALUE,
    SUBTITLES_OFF_VALUE,
    DEFAULT_SUBTITLE_APPEARANCE,
    DEFAULT_VOLUME_BOOST,
    DEFAULT_NORMALIZATION,
    NORMALIZATION_OPTIONS,
    SUBTITLE_BG_OPTIONS,
    SUBTITLE_COLOR_OPTIONS,
    SUBTITLE_EDGE_STYLE_OPTIONS,
    SUBTITLE_FONT_FAMILY_OPTIONS,
    SUBTITLE_FONT_SIZE_OPTIONS,
    SUBTITLE_POSITION_OPTIONS,
    VOLUME_BOOST_OPTIONS,
    type QualityOption,
    type SettingsView,
    type SubtitleAppearance,
    type SubtitleSettingsView,
} from '../types';
import {applyVolumeBoost, applyNormalization} from './audio-chain';
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

const SUBTITLE_SETTING_LABELS: Record<SubtitleSettingsView, string> = {
    'font-size': 'Font size',
    'text-color': 'Text color',
    'text-bg': 'Text background',
    'edge-style': 'Edge style',
    'font-family': 'Font family',
    'position': 'Position',
};

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
    const [subSettingsView, setSubSettingsView] = useState<SubtitleSettingsView | null>(null);
    const [subtitleAppearance, setSubtitleAppearance] = useState<SubtitleAppearance>(DEFAULT_SUBTITLE_APPEARANCE);
    const [volumeBoost, setVolumeBoost] = useState<string>(DEFAULT_VOLUME_BOOST);
    const [normalization, setNormalization] = useState<string>(DEFAULT_NORMALIZATION);

    useEffect(() => {
        const container = document.querySelector('.media-default-skin') as HTMLElement | null;
        if (!container) return;

        const fontSizeCss = SUBTITLE_FONT_SIZE_OPTIONS.find((o) => o.value === subtitleAppearance.fontSize)?.css ?? '1.1rem';
        const textColorCss = SUBTITLE_COLOR_OPTIONS.find((o) => o.value === subtitleAppearance.textColor)?.css ?? '#FFF';
        const textBgCss = SUBTITLE_BG_OPTIONS.find((o) => o.value === subtitleAppearance.textBg)?.css ?? 'rgba(0,0,0,0.8)';
        const edgeStyleCss = SUBTITLE_EDGE_STYLE_OPTIONS.find((o) => o.value === subtitleAppearance.edgeStyle)?.css ?? 'none';
        const fontFamilyCss = SUBTITLE_FONT_FAMILY_OPTIONS.find((o) => o.value === subtitleAppearance.fontFamily)?.css ?? 'sans-serif';
        const positionCss = SUBTITLE_POSITION_OPTIONS.find((o) => o.value === subtitleAppearance.position)?.css ?? '1.5rem';

        container.style.setProperty('--vjs-subtitle-font-size', fontSizeCss);
        container.style.setProperty('--vjs-subtitle-color', textColorCss);
        container.style.setProperty('--vjs-subtitle-bg', textBgCss);
        container.style.setProperty('--vjs-subtitle-edge-style', edgeStyleCss);
        container.style.setProperty('--vjs-subtitle-font-family', fontFamilyCss);
        container.style.setProperty('--vjs-subtitle-offset', positionCss);
    }, [subtitleAppearance]);

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
            setSubSettingsView(null);
        }
    }

    function navigateTo(nextView: SettingsView): void {
        setView(nextView);
        setSubSettingsView(null);
    }

    function renderSubSettingOptions(
        setting: SubtitleSettingsView,
        options: readonly {value: string; label: string}[],
        currentValue: string,
        onChange: (value: string) => void
    ): ReactNode {
        return (
            <>
                <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                     onClick={() => setSubSettingsView(null)}
                     onKeyDown={(event) => {
                         if (!isMenuActionKey(event.key)) return;
                         event.preventDefault();
                         setSubSettingsView(null);
                     }}>
                    <span className="media-settings__label">
                        <ChevronLeft className="media-icon"/>
                        <span>{SUBTITLE_SETTING_LABELS[setting]}</span>
                    </span>
                </div>
                <div className="media-menu__group" role="radiogroup" aria-label={SUBTITLE_SETTING_LABELS[setting]}>
                    {options.map((option) => (
                        <div key={option.value}
                             className="media-menu__item"
                             role="radio"
                             aria-checked={option.value === currentValue}
                             tabIndex={0}
                             onClick={() => onChange(option.value)}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 onChange(option.value);
                             }}>
                            <span>{option.label}</span>
                            {option.value === currentValue && (
                                <Check className="media-icon media-menu__indicator"/>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
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
                                 onClick={() => navigateTo('quality')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     navigateTo('quality');
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
                                 onClick={() => navigateTo('subtitles')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     navigateTo('subtitles');
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
                                 onClick={() => navigateTo('speed')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     navigateTo('speed');
                                 }}>
                                <span className="media-settings__label">
                                    <Timer className="media-icon"/>
                                    <span>Speed</span>
                                </span>
                                <span>{speedValue}x</span>
                            </div>
                        )}
                        <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('audio')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('audio');
                             }}>
                            <span className="media-settings__label">
                                <Volume2 className="media-icon"/>
                                <span>Audio</span>
                            </span>
                            <span>{volumeBoost}%</span>
                        </div>
                    </div>
                )}
                {view === 'quality' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('root');
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
                             onClick={() => navigateTo('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('root');
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
                        <div className="media-menu__separator"/>
                        <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('subtitles-settings')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('subtitles-settings');
                             }}>
                            <span className="media-settings__label">
                                <Palette className="media-icon"/>
                                <span>Text style</span>
                            </span>
                        </div>
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === null && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('subtitles')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('subtitles');
                             }}>
                            <span className="media-settings__label">
                                <ChevronLeft className="media-icon"/>
                                <span>Text style</span>
                            </span>
                        </div>
                        <div className="media-menu__group">
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('font-size')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('font-size');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Font size</span>
                                </span>
                                <span>{SUBTITLE_FONT_SIZE_OPTIONS.find((o) => o.value === subtitleAppearance.fontSize)?.label ?? 'Medium'}</span>
                            </div>
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('text-color')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('text-color');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Text color</span>
                                </span>
                                <span>{SUBTITLE_COLOR_OPTIONS.find((o) => o.value === subtitleAppearance.textColor)?.label ?? 'White'}</span>
                            </div>
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('text-bg')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('text-bg');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Text background</span>
                                </span>
                                <span>{SUBTITLE_BG_OPTIONS.find((o) => o.value === subtitleAppearance.textBg)?.label ?? 'Black'}</span>
                            </div>
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('edge-style')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('edge-style');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Edge style</span>
                                </span>
                                <span>{SUBTITLE_EDGE_STYLE_OPTIONS.find((o) => o.value === subtitleAppearance.edgeStyle)?.label ?? 'None'}</span>
                            </div>
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('font-family')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('font-family');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Font family</span>
                                </span>
                                <span>{SUBTITLE_FONT_FAMILY_OPTIONS.find((o) => o.value === subtitleAppearance.fontFamily)?.label ?? 'Proportional'}</span>
                            </div>
                            <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
                                 onClick={() => setSubSettingsView('position')}
                                 onKeyDown={(event) => {
                                     if (!isMenuActionKey(event.key)) return;
                                     event.preventDefault();
                                     setSubSettingsView('position');
                                 }}>
                                <span className="media-settings__label">
                                    <span>Position</span>
                                </span>
                                <span>{SUBTITLE_POSITION_OPTIONS.find((o) => o.value === subtitleAppearance.position)?.label ?? 'Default'}</span>
                            </div>
                        </div>
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'font-size' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'font-size',
                            SUBTITLE_FONT_SIZE_OPTIONS,
                            subtitleAppearance.fontSize,
                            (value) => setSubtitleAppearance((prev) => ({...prev, fontSize: value}))
                        )}
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'text-color' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'text-color',
                            SUBTITLE_COLOR_OPTIONS,
                            subtitleAppearance.textColor,
                            (value) => setSubtitleAppearance((prev) => ({...prev, textColor: value}))
                        )}
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'text-bg' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'text-bg',
                            SUBTITLE_BG_OPTIONS,
                            subtitleAppearance.textBg,
                            (value) => setSubtitleAppearance((prev) => ({...prev, textBg: value}))
                        )}
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'edge-style' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'edge-style',
                            SUBTITLE_EDGE_STYLE_OPTIONS,
                            subtitleAppearance.edgeStyle,
                            (value) => setSubtitleAppearance((prev) => ({...prev, edgeStyle: value}))
                        )}
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'font-family' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'font-family',
                            SUBTITLE_FONT_FAMILY_OPTIONS,
                            subtitleAppearance.fontFamily,
                            (value) => setSubtitleAppearance((prev) => ({...prev, fontFamily: value}))
                        )}
                    </div>
                )}
                {view === 'subtitles-settings' && subSettingsView === 'position' && (
                    <div className="media-menu__submenu">
                        {renderSubSettingOptions(
                            'position',
                            SUBTITLE_POSITION_OPTIONS,
                            subtitleAppearance.position,
                            (value) => setSubtitleAppearance((prev) => ({...prev, position: value}))
                        )}
                    </div>
                )}
                {view === 'audio' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('root');
                             }}>
                            <span className="media-settings__label">
                                <ChevronLeft className="media-icon"/>
                                <span>Audio</span>
                            </span>
                        </div>
                        <div className="media-menu__group">
                            <div className="media-menu__item media-menu__item--subheader" role="presentation">
                                <span>Volume boost</span>
                            </div>
                            {VOLUME_BOOST_OPTIONS.map((option) => (
                                <div key={option.value}
                                     className="media-menu__item"
                                     role="radio"
                                     aria-checked={option.value === volumeBoost}
                                     tabIndex={0}
                                     onClick={() => {
                                         setVolumeBoost(option.value);
                                         applyVolumeBoost(parseFloat(option.css));
                                     }}
                                     onKeyDown={(event) => {
                                         if (!isMenuActionKey(event.key)) return;
                                         event.preventDefault();
                                         setVolumeBoost(option.value);
                                         applyVolumeBoost(parseFloat(option.css));
                                     }}>
                                    <span>{option.label}</span>
                                    {option.value === volumeBoost && (
                                        <Check className="media-icon media-menu__indicator"/>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="media-menu__separator"/>
                        <div className="media-menu__group">
                            <div className="media-menu__item media-menu__item--subheader" role="presentation">
                                <span>Normalization</span>
                            </div>
                            {NORMALIZATION_OPTIONS.map((option) => (
                                <div key={option.value}
                                     className="media-menu__item"
                                     role="radio"
                                     aria-checked={option.value === normalization}
                                     tabIndex={0}
                                     onClick={() => {
                                         setNormalization(option.value);
                                         applyNormalization(option.value);
                                     }}
                                     onKeyDown={(event) => {
                                         if (!isMenuActionKey(event.key)) return;
                                         event.preventDefault();
                                         setNormalization(option.value);
                                         applyNormalization(option.value);
                                     }}>
                                    <span>{option.label}</span>
                                    {option.value === normalization && (
                                        <Check className="media-icon media-menu__indicator"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {view === 'speed' && (
                    <div className="media-menu__submenu">
                        <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                             onClick={() => navigateTo('root')}
                             onKeyDown={(event) => {
                                 if (!isMenuActionKey(event.key)) return;
                                 event.preventDefault();
                                 navigateTo('root');
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
            {view === 'subtitles-settings' && typeof document !== 'undefined' && createPortal(
                <div className="media-subtitle-preview">Sample subtitle text</div>,
                document.querySelector('.media-default-skin') ?? document.body
            )}
        </Menu.Root>
    );
}
