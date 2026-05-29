import {isValidElement} from 'react';
import type {RenderProp} from '@videojs/react';
import {
    AUTO_QUALITY_VALUE,
    type QualityMenuOption,
    type QualityOption,
    type SubtitleOption,
    SUBTITLES_OFF_VALUE
} from './types';

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isRenderProp(value: unknown): value is RenderProp<unknown> {
    return typeof value === 'function' || isValidElement(value);
}

export function getQualityOptions(qualities: QualityOption[] | undefined, source: string | null): QualityOption[] {
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

export function isHlsSource(source: string | null): source is string {
    return !!source && source.toLowerCase().includes('.m3u8');
}

export function parseHlsMasterPlaylist(masterSrc: string, content: string): QualityOption[] {
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
        attrs[key] = match[2]?.replace(/^"|"$/g, '') ?? '';
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

function sortByQuality(a: QualityMenuOption, b: QualityMenuOption): number {
    const extractHeight = (label: string): number => {
        const match = label.match(/^(\d+)[pP]/);
        return match ? parseInt(match[1], 10) : 0;
    };

    const extractBitrate = (label: string): number => {
        const match = label.match(/^([\d.]+)\s*Mbps/);
        return match ? parseFloat(match[1]) : 0;
    };

    const aHeight = extractHeight(a.label);
    const bHeight = extractHeight(b.label);

    if (aHeight && bHeight) return aHeight - bHeight;
    if (aHeight) return -1;
    if (bHeight) return 1;

    const aBitrate = extractBitrate(a.label);
    const bBitrate = extractBitrate(b.label);

    if (aBitrate && bBitrate) return aBitrate - bBitrate;
    if (aBitrate) return -1;
    if (bBitrate) return 1;

    return 0;
}

export function buildQualityMenuOptions(options: QualityOption[], masterSource: string): QualityMenuOption[] {
    const menuOptions: QualityMenuOption[] = options
        .filter((option) => option.src !== masterSource)
        .map((option) => ({...option, label: normalizeQualityLabel(option.label), value: option.src}))
        .sort(sortByQuality);

    if (isHlsSource(masterSource)) {
        menuOptions.unshift({label: 'Auto', src: masterSource, value: AUTO_QUALITY_VALUE});
    }

    return menuOptions;
}

export function resolveActiveQualityValue(
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

export function getSubtitleOptions(media: HTMLMediaElement | null): SubtitleOption[] {
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

export function getActiveSubtitleValue(media: HTMLMediaElement | null): string {
    if (!media?.textTracks) return SUBTITLES_OFF_VALUE;

    const track = Array.from(media.textTracks).find(
        (current) => (current.kind === 'subtitles' || current.kind === 'captions') && current.mode === 'showing'
    );

    if (!track) return SUBTITLES_OFF_VALUE;

    const trackIndex = Array.from(media.textTracks).findIndex((current) => current === track);
    return getSubtitleTrackValue(track, trackIndex >= 0 ? trackIndex : 0);
}

export function getSubtitleTrackValue(_track: TextTrack, index: number): string {
    // TextTrack ids/labels/languages can repeat; index keeps values unique per media element.
    return `track:${index}`;
}