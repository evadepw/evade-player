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

export interface SubtitleAppearance {
    fontSize: string;
    textColor: string;
    textBg: string;
    edgeStyle: string;
    fontFamily: string;
    position: string;
}

export interface SubtitleSettingOption {
    value: string;
    label: string;
    css: string;
}

export type SubtitleSettingsView = 'font-size' | 'text-color' | 'text-bg' | 'edge-style' | 'font-family' | 'position';

export const SUBTITLE_FONT_SIZE_OPTIONS: SubtitleSettingOption[] = [
    {value: 'small', label: 'Small', css: '0.8rem'},
    {value: 'medium', label: 'Medium', css: '1.1rem'},
    {value: 'large', label: 'Large', css: '1.5rem'},
];

export const SUBTITLE_COLOR_OPTIONS: SubtitleSettingOption[] = [
    {value: 'white', label: 'White', css: '#FFFFFF'},
    {value: 'yellow', label: 'Yellow', css: '#FFFF00'},
    {value: 'green', label: 'Green', css: '#00FF00'},
    {value: 'cyan', label: 'Cyan', css: '#00FFFF'},
    {value: 'blue', label: 'Blue', css: '#00BFFF'},
    {value: 'magenta', label: 'Magenta', css: '#FF00FF'},
    {value: 'red', label: 'Red', css: '#FF0000'},
];

export const SUBTITLE_BG_OPTIONS: SubtitleSettingOption[] = [
    {value: 'black', label: 'Black', css: 'rgba(0,0,0,0.8)'},
    {value: 'white', label: 'White', css: 'rgba(255,255,255,0.8)'},
    {value: 'yellow', label: 'Yellow', css: 'rgba(255,255,0,0.8)'},
    {value: 'green', label: 'Green', css: 'rgba(0,255,0,0.8)'},
    {value: 'cyan', label: 'Cyan', css: 'rgba(0,255,255,0.8)'},
    {value: 'blue', label: 'Blue', css: 'rgba(0,191,255,0.8)'},
    {value: 'magenta', label: 'Magenta', css: 'rgba(255,0,255,0.8)'},
    {value: 'red', label: 'Red', css: 'rgba(255,0,0,0.8)'},
    {value: 'none', label: 'None', css: 'transparent'},
];

export const SUBTITLE_EDGE_STYLE_OPTIONS: SubtitleSettingOption[] = [
    {value: 'none', label: 'None', css: 'none'},
    {value: 'raised', label: 'Raised', css: '2px 2px 4px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,0.4)'},
    {value: 'depressed', label: 'Depressed', css: '-2px -2px 4px rgba(0,0,0,1), 1px 1px 1px rgba(0,0,0,0.4)'},
    {value: 'uniform', label: 'Outline', css: '0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000'},
    {value: 'dropshadow', label: 'Drop shadow', css: '2px 2px 4px rgba(0,0,0,1)'},
];

export const SUBTITLE_FONT_FAMILY_OPTIONS: SubtitleSettingOption[] = [
    {value: 'proportional', label: 'Proportional', css: 'sans-serif'},
    {value: 'monospace', label: 'Monospace', css: 'monospace'},
    {value: 'sans-serif', label: 'Sans-serif', css: 'sans-serif'},
    {value: 'serif', label: 'Serif', css: 'serif'},
    {value: 'casual', label: 'Casual', css: '"Comic Sans MS", cursive'},
    {value: 'cursive', label: 'Cursive', css: 'cursive'},
    {value: 'small-caps', label: 'Small caps', css: 'small-caps'},
];

export const SUBTITLE_POSITION_OPTIONS: SubtitleSettingOption[] = [
    {value: 'low', label: 'Low', css: '1.5rem'},
    {value: 'default', label: 'Default', css: '3rem'},
    {value: 'high', label: 'High', css: '5rem'},
    {value: 'very-high', label: 'Very high', css: '6.5rem'},
];

export const DEFAULT_SUBTITLE_APPEARANCE: SubtitleAppearance = {
    fontSize: 'medium',
    textColor: 'white',
    textBg: 'black',
    edgeStyle: 'none',
    fontFamily: 'proportional',
    position: 'default',
};

export type SettingsView = 'root' | 'quality' | 'subtitles' | 'subtitles-settings' | 'audio' | 'season' | 'episode' | 'speed';
