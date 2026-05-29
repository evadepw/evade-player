'use client';

import {type ReactNode} from 'react';
import {X} from 'lucide-react';
import type {PlaybackState} from '../types';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface ResumePromptProps {
    state: PlaybackState;
    subtitle?: string;
    onResume: () => void;
    onDismiss: () => void;
}

export function ResumePrompt({state, subtitle, onResume, onDismiss}: ResumePromptProps): ReactNode {
    return (
        <div className="media-resume-prompt">
            <div className="media-surface media-resume-prompt__dialog">
                <button className="media-resume-prompt__close" onClick={onDismiss} aria-label="Dismiss">
                    <X className="media-icon"/>
                </button>
                <div className="media-resume-prompt__content">
                    <p className="media-resume-prompt__text">
                        Continue from {formatTime(state.time)}?
                    </p>
                    {subtitle && (
                        <p className="media-resume-prompt__subtitle">{subtitle}</p>
                    )}
                </div>
                <div className="media-resume-prompt__actions">
                    <button className="media-button media-button--primary" onClick={onResume}>
                        Resume
                    </button>
                </div>
            </div>
        </div>
    );
}
