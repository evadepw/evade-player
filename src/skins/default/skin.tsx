'use client';

import {type CSSProperties, type ReactNode, useEffect, useMemo, useState} from 'react';
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
    Poster,
    Container,
    BufferingIndicator,
    CastButton,
    Controls,
    ErrorDialog,
    FullscreenButton,
    Gesture,
    Hotkey,
    PlayButton,
    SeekIndicator,
    Slider,
    StatusAnnouncer,
    StatusIndicator,
    Time,
    TimeSlider,
    Tooltip,
    VolumeIndicator,
    type RenderProp
} from '@videojs/react';
import {Video} from '@videojs/react/video';
import {HlsVideo} from '@videojs/react/media/hls-video';
import {Button} from './components/button';
import {VolumePopover} from './components/volume-popover';
import {SettingsMenu} from './components/settings-menu';
import type {QualityOption} from './types';
import {isHlsSource, isRenderProp, isString} from './utils';
import {Player} from './player';

import './skin.css';

const TOP_STATUS_ACTIONS = ['toggleSubtitles', 'toggleFullscreen', 'togglePictureInPicture'] as const;

const CENTER_STATUS_ACTIONS = ['togglePaused'] as const;

const SEEK_TIME = 10;
const CAPTION_LINE_OFFSET = -3;

function CaptionLineOffset(): null {
    const media = Player.useMedia();

    useEffect(() => {
        const mediaElement = media as HTMLMediaElement | null;
        if (!mediaElement?.textTracks) {
            return;
        }

        const textTracks = mediaElement.textTracks;

        const applyCueLineOffset = () => {
            for (const track of Array.from(textTracks) as TextTrack[]) {
                if (track.kind !== 'subtitles' && track.kind !== 'captions') {
                    continue;
                }

                const cues = track.cues ? Array.from(track.cues) as VTTCue[] : [];
                for (const cue of cues) {
                    if ('line' in cue && cue.line !== CAPTION_LINE_OFFSET) {
                        try {
                            cue.line = CAPTION_LINE_OFFSET;
                        } catch {
                            // Ignore cues that do not allow runtime line updates.
                        }
                    }
                }
            }
        };

        applyCueLineOffset();

        const onTrackEvent = () => applyCueLineOffset();
        textTracks.addEventListener('addtrack', onTrackEvent);
        textTracks.addEventListener('change', onTrackEvent);

        const intervalId = window.setInterval(applyCueLineOffset, 1000);

        return () => {
            textTracks.removeEventListener('addtrack', onTrackEvent);
            textTracks.removeEventListener('change', onTrackEvent);
            window.clearInterval(intervalId);
        };
    }, [media]);

    return null;
}

export interface VideoPlayerProps {
    src: string;
    qualities?: QualityOption[];
    style?: CSSProperties;
    className?: string;
    poster?: string | RenderProp<Poster.State> | undefined;
    thumbnailStoryboardSrc?: string;
    errorDescription?: string;
}

interface StoryboardThumbnailApiItem {
    url: string;
    start_time: number;
    end_time?: number;
    width?: number;
    height?: number;
    coords?: { x: number; y: number };
}

interface StoryboardThumbnailItem {
    url: string;
    startTime: number;
    endTime?: number;
    width?: number;
    height?: number;
    coords?: { x: number; y: number };
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
export function VideoPlayer({
    src,
    qualities,
    className,
    poster,
    thumbnailStoryboardSrc,
    errorDescription,
    ...rest
}: VideoPlayerProps): ReactNode {
    const isHls = isHlsSource(src);
    const [storyboardItems, setStoryboardItems] = useState<StoryboardThumbnailApiItem[] | null>(null);

    useEffect(() => {
        if (!thumbnailStoryboardSrc) {
            return;
        }

        const controller = new AbortController();

        void fetch(thumbnailStoryboardSrc, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load storyboard: ${response.status}`);
                }
                return response.json() as Promise<StoryboardThumbnailApiItem[]>;
            })
            .then((payload) => {
                if (!Array.isArray(payload)) {
                    setStoryboardItems(null);
                    return;
                }
                setStoryboardItems(payload);
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                setStoryboardItems(null);
            });

        return () => controller.abort();
    }, [thumbnailStoryboardSrc]);

    const thumbnails = useMemo<StoryboardThumbnailItem[] | undefined>(() => {
        if (!storyboardItems || storyboardItems.length === 0) {
            return undefined;
        }

        return storyboardItems
            .filter((item) => typeof item.url === 'string' && typeof item.start_time === 'number')
            .map((item) => ({
                url: item.url,
                startTime: item.start_time,
                endTime: item.end_time,
                width: item.width,
                height: item.height,
                coords: item.coords
            }));
    }, [storyboardItems]);

    return (
        <Player.Provider>
            <CaptionLineOffset/>
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
                                    <Slider.Thumbnail className="media-preview__thumbnail" thumbnails={thumbnails}/>
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
