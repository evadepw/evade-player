export interface QualityOption {
    label: string;
    src: string;
}

export interface QualityMenuOption extends QualityOption {
    value: string;
}

export interface SubtitleOption {
    value: string;
    label: string;
}

export interface AudioOption {
    value: string;
    label: string;
}

export const AUTO_QUALITY_VALUE = '__auto__';
export const SUBTITLES_OFF_VALUE = '__subtitles_off__';
export const AUDIO_OFF_VALUE = '__audio_off__';

export type SettingsView = 'root' | 'quality' | 'subtitles' | 'audio' | 'season' | 'episode' | 'speed';
