import type {ReactNode} from 'react';
import {ChevronLeft, Check} from 'lucide-react';
import type {SubtitleAppearance, SubtitleSettingsView, SubtitleSettingOption} from '../types';
import {
    SUBTITLE_FONT_SIZE_OPTIONS,
    SUBTITLE_COLOR_OPTIONS,
    SUBTITLE_BG_OPTIONS,
    SUBTITLE_EDGE_STYLE_OPTIONS,
    SUBTITLE_FONT_FAMILY_OPTIONS,
    SUBTITLE_POSITION_OPTIONS,
} from '../types';

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

function renderSubSettingOptions(
    setting: SubtitleSettingsView,
    options: readonly SubtitleSettingOption[],
    currentValue: string,
    onChange: (value: string) => void,
    onBack: () => void,
): ReactNode {
    return (
        <>
            <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                 onClick={onBack}
                 onKeyDown={(event) => {
                     if (!isMenuActionKey(event.key)) return;
                     event.preventDefault();
                     onBack();
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

interface SubtitleSettingsContentProps {
    subSettingsView: SubtitleSettingsView | null;
    subtitleAppearance: SubtitleAppearance;
    onSubtitleAppearanceChange: (update: Partial<SubtitleAppearance>) => void;
    onBack: () => void;
}

export function SubtitleSettingsContent({
    subSettingsView,
    subtitleAppearance,
    onSubtitleAppearanceChange,
    onBack,
}: SubtitleSettingsContentProps): ReactNode {
    if (subSettingsView === null) {
        return (
            <div className="media-menu__submenu">
                <div className="media-menu__item media-menu__item--back" role="menuitem" tabIndex={0}
                     onClick={onBack}
                     onKeyDown={(event) => {
                         if (!isMenuActionKey(event.key)) return;
                         event.preventDefault();
                         onBack();
                     }}>
                    <span className="media-settings__label">
                        <ChevronLeft className="media-icon"/>
                        <span>Text style</span>
                    </span>
                </div>
                <div className="media-menu__group">
                    {([
                        ['font-size', SUBTITLE_FONT_SIZE_OPTIONS, subtitleAppearance.fontSize] as const,
                        ['text-color', SUBTITLE_COLOR_OPTIONS, subtitleAppearance.textColor] as const,
                        ['text-bg', SUBTITLE_BG_OPTIONS, subtitleAppearance.textBg] as const,
                        ['edge-style', SUBTITLE_EDGE_STYLE_OPTIONS, subtitleAppearance.edgeStyle] as const,
                        ['font-family', SUBTITLE_FONT_FAMILY_OPTIONS, subtitleAppearance.fontFamily] as const,
                        ['position', SUBTITLE_POSITION_OPTIONS, subtitleAppearance.position] as const,
                    ]).map(([key, options, value]) => (
                        <SubSettingEntry
                            key={key}
                            label={SUBTITLE_SETTING_LABELS[key]}
                            valueLabel={options.find((o) => o.value === value)?.label ?? 'Default'}
                            onClick={() => onSubtitleAppearanceChange({[key]: value})}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const optionsMap: Record<SubtitleSettingsView, readonly SubtitleSettingOption[]> = {
        'font-size': SUBTITLE_FONT_SIZE_OPTIONS,
        'text-color': SUBTITLE_COLOR_OPTIONS,
        'text-bg': SUBTITLE_BG_OPTIONS,
        'edge-style': SUBTITLE_EDGE_STYLE_OPTIONS,
        'font-family': SUBTITLE_FONT_FAMILY_OPTIONS,
        'position': SUBTITLE_POSITION_OPTIONS,
    };

    const updateMap: Record<SubtitleSettingsView, keyof SubtitleAppearance> = {
        'font-size': 'fontSize',
        'text-color': 'textColor',
        'text-bg': 'textBg',
        'edge-style': 'edgeStyle',
        'font-family': 'fontFamily',
        'position': 'position',
    };

    const options = optionsMap[subSettingsView];
    const prop = updateMap[subSettingsView];
    const currentValue = subtitleAppearance[prop];

    return (
        <div className="media-menu__submenu">
            {renderSubSettingOptions(
                subSettingsView,
                options,
                currentValue,
                (value) => onSubtitleAppearanceChange({[prop]: value}),
                () => onSubtitleAppearanceChange({}),
            )}
        </div>
    );
}

function SubSettingEntry({label, valueLabel, onClick}: { label: string; valueLabel: string; onClick: () => void }): ReactNode {
    return (
        <div className="media-menu__item media-menu__item--submenu media-settings__entry" role="menuitem" tabIndex={0}
             onClick={onClick}
             onKeyDown={(event) => {
                 if (!isMenuActionKey(event.key)) return;
                 event.preventDefault();
                 onClick();
             }}>
            <span className="media-settings__label">
                <span>{label}</span>
            </span>
            <span>{valueLabel}</span>
        </div>
    );
}
