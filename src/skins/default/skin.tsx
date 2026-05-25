'use client';

import {type CSSProperties, type ComponentProps, forwardRef, type ReactNode, isValidElement, useEffect, useMemo, useState} from 'react';
import {
    CaptionsOffIcon,
    CaptionsOnIcon,
    CastEnterIcon,
    CastExitIcon,
    ChevronIcon,
    FullscreenEnterIcon,
    FullscreenExitIcon,
    PauseIcon,
    PipEnterIcon,
    PipExitIcon,
    PlayIcon,
    RestartIcon,
    SpinnerIcon,
    VolumeHighIcon,
    VolumeLowIcon,
    VolumeOffIcon
} from '@videojs/react/icons';
import {
    Captions,
    Check,
    ChevronLeft,
    Gauge,
    Settings,
    Timer
} from 'lucide-react';
import {
    createPlayer,
    Poster,
    Container,
    useMedia,
    usePlayer,
    BufferingIndicator,
    CastButton,
    Controls,
    ErrorDialog,
    FullscreenButton,
    Gesture,
    Hotkey,
    Menu,
    MuteButton,
    PlayButton,
    Popover,
    SeekIndicator,
    Slider,
    StatusAnnouncer,
    StatusIndicator,
    Time,
    TimeSlider,
    Tooltip,
    VolumeIndicator,
    VolumeSlider,
    type RenderProp
} from '@videojs/react';
import {Video, videoFeatures} from '@videojs/react/video';
import {HlsVideo} from '@videojs/react/media/hls-video';
import {bufferFeature, sourceFeature, textTrackFeature} from '@videojs/react'

import './skin.css';

const TOP_STATUS_ACTIONS = ['toggleSubtitles', 'toggleFullscreen', 'togglePictureInPicture'] as const;

const CENTER_STATUS_ACTIONS = ['togglePaused'] as const;

interface QualityOption {
    label: string;
    src: string;
}

interface QualityMenuOption extends QualityOption {
    value: string;
}

interface SubtitleOption {
    value: string;
    label: string;
}

const AUTO_QUALITY_VALUE = '__auto__';
const SUBTITLES_OFF_VALUE = '__subtitles_off__';
type SettingsView = 'root' | 'quality' | 'subtitles' | 'speed';

function isMenuActionKey(key: string): boolean {
    return key === 'Enter' || key === ' ';
}

// ================================================================
// Player
// ================================================================

const SEEK_TIME = 10;

export const Player = createPlayer({features: [...videoFeatures, bufferFeature, sourceFeature, textTrackFeature]});

export interface VideoPlayerProps {
    src: string;
    qualities?: QualityOption[];
    style?: CSSProperties;
    className?: string;
    poster?: string | RenderProp<Poster.State> | undefined;
    errorDescription?: string;
}

/**
 * @example
 * ```tsx
 * <VideoPlayer
 *   src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
 *   poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
 * />
 * ```
 */
export function VideoPlayer({src, qualities, className, poster, errorDescription, ...rest}: VideoPlayerProps): ReactNode {
    const isHls = isHlsSource(src);

    return (
        <Player.Provider>
            <Container className={`media-default-skin media-default-skin--video ${className ?? ''}`} {...rest}>
                {isHls ? (
                    <HlsVideo
                        src={src}
                        playsInline
                        crossOrigin="anonymous"
                        config={{
                            renderTextTracksNatively: true,
                            enableWebVTT: true,
                            enableCEA708Captions: true
                        }}
                    />
                ) : (
                    <Video src={src} playsInline crossOrigin="anonymous"/>
                )}

                {poster && (
                    <Poster src={isString(poster) ? poster : undefined} render={isRenderProp(poster) ? poster : undefined}/>
                )}

                <BufferingIndicator
                    render={(props) => (
                        <div {...props} className="media-buffering-indicator">
                            <div className="media-surface">
                                <SpinnerIcon className="media-icon"/>
                            </div>
                        </div>
                    )}
                />

                <ErrorDialog.Root>
                    <ErrorDialog.Popup className="media-error">
                        <div className="media-error__dialog media-surface">
                            <div className="media-error__content">
                                <ErrorDialog.Title className="media-error__title">Something went wrong.</ErrorDialog.Title>
                                <ErrorDialog.Description className="media-error__description">
                                    {errorDescription}
                                </ErrorDialog.Description>
                            </div>
                            <div className="media-error__actions">
                                <ErrorDialog.Close className="media-button media-button--primary">OK</ErrorDialog.Close>
                            </div>
                        </div>
                    </ErrorDialog.Popup>
                </ErrorDialog.Root>

                <Controls.Root className="media-surface media-controls">
                    <Tooltip.Provider>
                        <div className="media-button-group">
                            <Tooltip.Root side="top">
                                <Tooltip.Trigger
                                    render={
                                        <PlayButton className="media-button--play" render={<Button/>}>
                                            <RestartIcon className="media-icon media-icon--restart"/>
                                            <PlayIcon className="media-icon media-icon--play"/>
                                            <PauseIcon className="media-icon media-icon--pause"/>
                                        </PlayButton>
                                    }
                                />
                                <Tooltip.Popup className="media-surface media-tooltip"/>
                            </Tooltip.Root>
                        </div>

                        <div className="media-time-controls">
                            <Time.Value type="current" className="media-time"/>
                            <TimeSlider.Root className="media-slider">
                                <TimeSlider.Track className="media-slider__track">
                                    <TimeSlider.Fill className="media-slider__fill"/>
                                    <TimeSlider.Buffer className="media-slider__buffer"/>
                                </TimeSlider.Track>
                                <TimeSlider.Thumb className="media-slider__thumb"/>

                                <div className="media-surface media-preview media-slider__preview">
                                    <Slider.Thumbnail className="media-preview__thumbnail"/>
                                    <TimeSlider.Value type="pointer" className="media-time media-preview__time"/>
                                    <SpinnerIcon className="media-preview__spinner media-icon"/>
                                </div>
                            </TimeSlider.Root>
                            <Time.Value type="duration" className="media-time"/>
                        </div>

                        <div className="media-button-group">
                            <SettingsMenu qualities={qualities} masterSource={src}/>

                            <VolumePopover/>

                            <Tooltip.Root side="top">
                                <Tooltip.Trigger
                                    render={
                                        <CastButton className="media-button--cast" render={<Button/>}>
                                            <CastEnterIcon className="media-icon media-icon--cast-enter"/>
                                            <CastExitIcon className="media-icon media-icon--cast-exit"/>
                                        </CastButton>
                                    }
                                />
                                <Tooltip.Popup className="media-surface media-tooltip"/>
                            </Tooltip.Root>

                            <Tooltip.Root side="top">
                                <Tooltip.Trigger
                                    render={
                                        <FullscreenButton className="media-button--fullscreen" render={<Button/>}>
                                            <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter"/>
                                            <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit"/>
                                        </FullscreenButton>
                                    }
                                />
                                <Tooltip.Popup className="media-surface media-tooltip"/>
                            </Tooltip.Root>
                        </div>
                    </Tooltip.Provider>
                </Controls.Root>

                <div className="media-overlay"/>

                {/* Hotkeys */}
                <Hotkey keys="Space" action="togglePaused"/>
                <Hotkey keys="k" action="togglePaused"/>
                <Hotkey keys="m" action="toggleMuted"/>
                <Hotkey keys="f" action="toggleFullscreen"/>
                <Hotkey keys="c" action="toggleSubtitles"/>
                <Hotkey keys="i" action="togglePictureInPicture"/>
                <Hotkey keys="ArrowRight" action="seekStep" value={SEEK_TIME / 2}/>
                <Hotkey keys="ArrowLeft" action="seekStep" value={-(SEEK_TIME / 2)}/>
                <Hotkey keys="l" action="seekStep" value={SEEK_TIME}/>
                <Hotkey keys="j" action="seekStep" value={-SEEK_TIME}/>
                <Hotkey keys="ArrowUp" action="volumeStep" value={0.05}/>
                <Hotkey keys="ArrowDown" action="volumeStep" value={-0.05}/>
                <Hotkey keys="0-9" action="seekToPercent"/>
                <Hotkey keys="Home" action="seekToPercent" value={0}/>
                <Hotkey keys="End" action="seekToPercent" value={100}/>
                <Hotkey keys=">" action="speedUp"/>
                <Hotkey keys="<" action="speedDown"/>

                {/* Gestures */}
                <Gesture type="tap" action="togglePaused" pointer="mouse" region="center"/>
                <Gesture type="tap" action="toggleControls" pointer="touch"/>
                <Gesture type="doubletap" action="seekStep" value={-SEEK_TIME} region="left"/>
                <Gesture type="doubletap" action="toggleFullscreen" region="center"/>
                <Gesture type="doubletap" action="seekStep" value={SEEK_TIME} region="right"/>

                {/* Input Feedback */}
                <StatusAnnouncer/>
                <div className="media-input-feedback">
                    <VolumeIndicator.Root
                        className="media-surface media-input-feedback-island media-input-feedback-island--volume">
                        <VolumeIndicator.Fill className="media-input-feedback-island__content">
                            <VolumeHighIcon className="media-icon media-icon--volume-high"/>
                            <VolumeLowIcon className="media-icon media-icon--volume-low"/>
                            <VolumeOffIcon className="media-icon media-icon--volume-off"/>
                            <VolumeIndicator.Value className="media-input-feedback-island__value"/>
                        </VolumeIndicator.Fill>
                    </VolumeIndicator.Root>

                    <StatusIndicator.Root
                        actions={TOP_STATUS_ACTIONS}
                        className="media-surface media-input-feedback-island media-input-feedback-island--status"
                    >
                        <div className="media-input-feedback-island__content">
                            <CaptionsOnIcon className="media-icon media-icon--captions-on"/>
                            <CaptionsOffIcon className="media-icon media-icon--captions-off"/>
                            <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter"/>
                            <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit"/>
                            <PipEnterIcon className="media-icon media-icon--pip-enter"/>
                            <PipExitIcon className="media-icon media-icon--pip-exit"/>
                            <StatusIndicator.Value className="media-input-feedback-island__value"/>
                        </div>
                    </StatusIndicator.Root>

                    <SeekIndicator.Root className="media-input-feedback-bubble">
                        <ChevronIcon className="media-icon media-icon--seek"/>
                        <SeekIndicator.Value className="media-time"/>
                    </SeekIndicator.Root>

                    <StatusIndicator.Root actions={CENTER_STATUS_ACTIONS} className="media-input-feedback-bubble">
                        <PlayIcon className="media-icon media-icon--play"/>
                        <PauseIcon className="media-icon media-icon--pause"/>
                    </StatusIndicator.Root>
                </div>
            </Container>

        </Player.Provider>
    );
}

// ================================================================
// Components
// ================================================================

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(function Button({className, ...props}, ref) {
    return (
        <button
            ref={ref}
            type="button"
            className={`media-button media-button--subtle media-button--icon ${className ?? ''}`}
            {...props}
        />
    );
});

function VolumePopover(): ReactNode {
    const volumeUnsupported = usePlayer((s) => s.volumeAvailability === 'unsupported');

    const muteButton = (
        <MuteButton className="media-button--mute" render={<Button/>}>
            <VolumeOffIcon className="media-icon media-icon--volume-off"/>
            <VolumeLowIcon className="media-icon media-icon--volume-low"/>
            <VolumeHighIcon className="media-icon media-icon--volume-high"/>
        </MuteButton>
    );

    if (volumeUnsupported) return muteButton;

    return (
        <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
            <Popover.Trigger render={muteButton}/>
            <Popover.Popup className="media-surface media-popover media-popover--volume">
                <VolumeSlider.Root className="media-slider" orientation="vertical" thumbAlignment="edge">
                    <VolumeSlider.Track className="media-slider__track">
                        <VolumeSlider.Fill className="media-slider__fill"/>
                    </VolumeSlider.Track>
                    <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent"/>
                </VolumeSlider.Root>
            </Popover.Popup>
        </Popover.Root>
    );
}

function SettingsMenu({qualities, masterSource}: { qualities?: QualityOption[]; masterSource: string }): ReactNode {
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
                <Settings className="media-icon" />
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

function getSubtitleOptions(media: HTMLMediaElement | null): SubtitleOption[] {
    const options: SubtitleOption[] = [{value: SUBTITLES_OFF_VALUE, label: 'Off'}];
    if (!media?.textTracks) return options;

    Array.from(media.textTracks).forEach((track, index) => {
        if (track.kind !== 'subtitles' && track.kind !== 'captions') return;
        options.push({
            value: getSubtitleTrackValue(track, index),
            label: track.label || track.language || `Track ${index + 1}`
        });
    });

    return options;
}

function getActiveSubtitleValue(media: HTMLMediaElement | null): string {
    if (!media?.textTracks) return SUBTITLES_OFF_VALUE;

    const track = Array.from(media.textTracks).find(
        (current) => (current.kind === 'subtitles' || current.kind === 'captions') && current.mode === 'showing'
    );

    if (!track) return SUBTITLES_OFF_VALUE;

    const trackIndex = Array.from(media.textTracks).findIndex((current) => current === track);
    return getSubtitleTrackValue(track, trackIndex >= 0 ? trackIndex : 0);
}

function getSubtitleTrackValue(_track: TextTrack, index: number): string {
    // TextTrack ids/labels/languages can repeat; index keeps values unique per media element.
    return `track:${index}`;
}

// ================================================================
// Utilities
// ================================================================

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isRenderProp(value: unknown): value is RenderProp<unknown> {
    return typeof value === 'function' || isValidElement(value);
}

function getQualityOptions(qualities: QualityOption[] | undefined, source: string | null): QualityOption[] {
    const options = qualities?.filter((option) => option.src.trim().length > 0) ?? [];
    const map = new Map<string, QualityOption>();

    for (const option of options) {
        if (!map.has(option.src)) {
            map.set(option.src, option);
        }
    }

    if (source && !map.has(source)) {
        map.set(source, {label: 'Auto', src: source});
    }

    return [...map.values()];
}

function isHlsSource(source: string | null): source is string {
    return !!source && source.toLowerCase().includes('.m3u8');
}

function parseHlsMasterPlaylist(masterSrc: string, content: string): QualityOption[] {
    const lines = content.split(/\r?\n/);
    const options: QualityOption[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]?.trim();
        if (!line || !line.startsWith('#EXT-X-STREAM-INF:')) continue;

        const nextLine = lines[i + 1]?.trim();
        if (!nextLine || nextLine.startsWith('#')) continue;

        const streamUrl = resolvePlaylistUrl(masterSrc, nextLine);
        if (!streamUrl || seen.has(streamUrl)) continue;

        const attrs = parseM3u8Attributes(line.slice('#EXT-X-STREAM-INF:'.length));
        if (!hasAudioInStreamAttributes(attrs)) continue;
        const label = getQualityLabel(attrs, options.length);

        seen.add(streamUrl);
        options.push({label, src: streamUrl});
    }

    return options;
}

function hasAudioInStreamAttributes(attrs: Record<string, string>): boolean {
    if (attrs.AUDIO && attrs.AUDIO.trim().length > 0) return true;

    const codecs = (attrs.CODECS ?? '').toLowerCase();
    if (!codecs) return false;

    return ['mp4a', 'ac-3', 'ec-3', 'opus', 'vorbis', 'flac'].some((codec) => codecs.includes(codec));
}

function parseM3u8Attributes(raw: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const regex = /([A-Z0-9-]+)=((?:"[^"]*")|[^,]*)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw)) !== null) {
        const key = match[1];
        const value = match[2]?.replace(/^"|"$/g, '') ?? '';
        attrs[key] = value;
    }

    return attrs;
}

function getQualityLabel(attrs: Record<string, string>, index: number): string {
    const resolution = attrs.RESOLUTION;
    if (resolution && resolution.includes('x')) {
        const height = Number(resolution.split('x')[1]);
        if (Number.isFinite(height)) {
            return `${height}p`;
        }
    }

    const bandwidth = Number(attrs.BANDWIDTH);
    if (Number.isFinite(bandwidth) && bandwidth > 0) {
        const mbps = bandwidth / 1_000_000;
        return `${mbps.toFixed(mbps >= 10 ? 0 : 1)} Mbps`;
    }

    return `Quality ${index + 1}`;
}

function normalizeQualityLabel(label: string): string {
    const normalized = label.trim().toUpperCase();
    if (normalized === '4K') return '2160p';
    if (normalized === '2K') return '1440p';
    if (normalized === 'FHD') return '1080p';
    if (normalized === 'HD') return '720p';
    if (normalized === 'SD') return '480p';
    return label;
}

function resolvePlaylistUrl(masterSrc: string, uri: string): string {
    try {
        return new URL(uri, masterSrc).toString();
    } catch {
        return '';
    }
}

function buildQualityMenuOptions(options: QualityOption[], masterSource: string): QualityMenuOption[] {
    const menuOptions: QualityMenuOption[] = options
        .filter((option) => option.src !== masterSource)
        .map((option) => ({...option, label: normalizeQualityLabel(option.label), value: option.src}));

    if (isHlsSource(masterSource)) {
        menuOptions.unshift({label: 'Auto', src: masterSource, value: AUTO_QUALITY_VALUE});
    }

    return menuOptions;
}

function resolveActiveQualityValue(
    options: QualityMenuOption[],
    source: string | null,
    masterSource: string
): string {
    if (!source) return options[0]?.value;
    if (source === masterSource) return AUTO_QUALITY_VALUE;

    const exact = options.find((option) => option.src === source);
    if (exact) return exact.value;

    return options[0].value;
}
