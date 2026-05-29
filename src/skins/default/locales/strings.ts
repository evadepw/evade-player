import type {FragmentType} from '../types';

export type Locale = 'ru' | 'en';

export interface LocaleStrings {
    commonAuto: string;
    commonBack: string;
    commonOk: string;
    commonOn: string;
    commonOff: string;
    commonDefault: string;

    settingsTrigger: string;
    settingsQuality: string;
    settingsSpeed: string;
    settingsSubtitles: string;
    settingsFragments: string;
    settingsAudio: string;
    settingsVideoQuality: string;
    settingsPlaybackRate: string;
    settingsTextStyle: string;
    settingsVolumeBoost: string;
    settingsNormalization: string;
    settingsSampleSubtitle: string;

    errorTitle: string;

    resumeContinueFrom: string;
    resumeResume: string;
    resumeDismiss: string;

    selectorSeason: string;
    selectorEpisode: string;
    selectorVoiceover: string;

    qualityTrack: string;

    subtitlesOff: string;
    subtitlesTrack: string;

    fragmentOpening: string;
    fragmentEnding: string;
    fragmentPreview: string;
    fragmentCompilation: string;

    subtitleFontSize: string;
    subtitleTextColor: string;
    subtitleTextBg: string;
    subtitleEdgeStyle: string;
    subtitleFontFamily: string;
    subtitlePosition: string;

    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;

    colorWhite: string;
    colorYellow: string;
    colorGreen: string;
    colorCyan: string;
    colorBlue: string;
    colorMagenta: string;
    colorRed: string;

    bgBlack: string;
    bgWhite: string;
    bgYellow: string;
    bgGreen: string;
    bgCyan: string;
    bgBlue: string;
    bgMagenta: string;
    bgRed: string;
    bgNone: string;

    edgeNone: string;
    edgeRaised: string;
    edgeDepressed: string;
    edgeOutline: string;
    edgeDropShadow: string;

    fontProportional: string;
    fontMonospace: string;
    fontSansSerif: string;
    fontSerif: string;
    fontCasual: string;
    fontCursive: string;
    fontSmallCaps: string;

    positionLow: string;
    positionDefault: string;
    positionHigh: string;
    positionVeryHigh: string;

    volumeBoost50: string;
    volumeBoost100: string;
    volumeBoost150: string;
    volumeBoost200: string;
    volumeBoost300: string;

    normalizationOff: string;
    normalizationLight: string;
    normalizationMedium: string;
    normalizationStrong: string;
}

// --- Option label resolvers ---

type LabelValueMap = Record<string, keyof LocaleStrings>;

const FONT_SIZE_MAP: LabelValueMap = {
    small: 'fontSizeSmall',
    medium: 'fontSizeMedium',
    large: 'fontSizeLarge',
};

const COLOR_MAP: LabelValueMap = {
    white: 'colorWhite',
    yellow: 'colorYellow',
    green: 'colorGreen',
    cyan: 'colorCyan',
    blue: 'colorBlue',
    magenta: 'colorMagenta',
    red: 'colorRed',
};

const BG_MAP: LabelValueMap = {
    black: 'bgBlack',
    white: 'bgWhite',
    yellow: 'bgYellow',
    green: 'bgGreen',
    cyan: 'bgCyan',
    blue: 'bgBlue',
    magenta: 'bgMagenta',
    red: 'bgRed',
    none: 'bgNone',
};

const EDGE_STYLE_MAP: LabelValueMap = {
    none: 'edgeNone',
    raised: 'edgeRaised',
    depressed: 'edgeDepressed',
    uniform: 'edgeOutline',
    dropshadow: 'edgeDropShadow',
};

const FONT_FAMILY_MAP: LabelValueMap = {
    proportional: 'fontProportional',
    monospace: 'fontMonospace',
    'sans-serif': 'fontSansSerif',
    serif: 'fontSerif',
    casual: 'fontCasual',
    cursive: 'fontCursive',
    'small-caps': 'fontSmallCaps',
};

const POSITION_MAP: LabelValueMap = {
    low: 'positionLow',
    default: 'positionDefault',
    high: 'positionHigh',
    'very-high': 'positionVeryHigh',
};

const VOLUME_BOOST_MAP: LabelValueMap = {
    '50': 'volumeBoost50',
    '100': 'volumeBoost100',
    '150': 'volumeBoost150',
    '200': 'volumeBoost200',
    '300': 'volumeBoost300',
};

const NORMALIZATION_MAP: LabelValueMap = {
    off: 'normalizationOff',
    light: 'normalizationLight',
    medium: 'normalizationMedium',
    strong: 'normalizationStrong',
};

function resolveOptionLabel(value: string, map: LabelValueMap, t: LocaleStrings, fallback: string): string {
    const key = map[value];
    return key ? t[key] : fallback;
}

export function getFontSizeLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, FONT_SIZE_MAP, t, value);
}

export function getColorLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, COLOR_MAP, t, value);
}

export function getBgLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, BG_MAP, t, value);
}

export function getEdgeStyleLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, EDGE_STYLE_MAP, t, value);
}

export function getFontFamilyLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, FONT_FAMILY_MAP, t, value);
}

export function getPositionLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, POSITION_MAP, t, value);
}

export function getVolumeBoostLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, VOLUME_BOOST_MAP, t, value);
}

export function getNormalizationLabel(value: string, t: LocaleStrings): string {
    return resolveOptionLabel(value, NORMALIZATION_MAP, t, value);
}

export const FRAGMENT_LABELS_RU: Record<FragmentType, string> = {
    opening: 'Опенинг',
    ending: 'Эндинг',
    preview: 'Заставка',
    compilation: 'Компиляция',
};

export const FRAGMENT_LABELS_EN: Record<FragmentType, string> = {
    opening: 'Opening',
    ending: 'Ending',
    preview: 'Preview',
    compilation: 'Recap',
};

export function getFragmentLabel(type: FragmentType, locale: Locale): string {
    return locale === 'en' ? FRAGMENT_LABELS_EN[type] : FRAGMENT_LABELS_RU[type];
}
