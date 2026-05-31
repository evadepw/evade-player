import { useState, type FC } from 'react';
import { VideoPlayer } from './skins/default/skin.tsx';
import { version } from '../package.json';
import logoSrc from './assets/evade-player-logo.png';

const VIDEO_SRC = import.meta.env.VITE_VIDEO_SRC ?? '';
const POSTER_SRC = import.meta.env.VITE_POSTER_SRC ?? '';
const THUMBNAIL_STORYBOARD_SRC = import.meta.env.VITE_THUMBNAIL_STORYBOARD_SRC ?? '';
const BASE_URL = import.meta.env.BASE_URL;

const voiceoverOptions = [
    {label: 'English', value: 'en'},
    {label: 'Russian', value: 'ru'},
    {label: 'Japanese', value: 'ja'},
    {label: 'Korean', value: 'ko'},
    {label: 'Chinese', value: 'zh'},
    {label: 'French', value: 'fr'},
    {label: 'German', value: 'de'},
    {label: 'Spanish', value: 'es'},
    {label: 'Italian', value: 'it'},
    {label: 'Portuguese', value: 'pt'},
    {label: 'Thai', value: 'th'},
    {label: 'Vietnamese', value: 'vi'},
];



function GithubIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" clipRule="evenodd"/>
        </svg>
    );
}

function ExternalIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
    );
}

const features = [
    {
        title: 'HLS Streaming',
        description: 'Adaptive bitrate streaming via hls.js with automatic quality selection.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
        ),
    },
    {
        title: 'Accessible Controls',
        description: 'Full keyboard navigation, screen reader announcements, and gesture support.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01"/>
            </svg>
        ),
    },
    {
        title: 'Audio Processing',
        description: 'Volume boost and dynamic range compression via the Web Audio API.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
        ),
    },
    {
        title: 'Fragment Skip',
        description: 'Auto-skip openings, endings, and previews with colored timeline markers.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
        ),
    },
    {
        title: 'Content Navigation',
        description: 'Built-in season, episode, and voiceover selector with hierarchy support.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
        ),
    },
    {
        title: 'Web Component',
        description: 'Use as a framework-agnostic custom element — works anywhere.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
            </svg>
        ),
    },
    {
        title: 'Localization',
        description: 'Russian and English UI with locale context for easy extension.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        ),
    },
    {
        title: 'State Persistence',
        description: 'Remembers playback position, settings, and preferences in localStorage.',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
        ),
    },
];

    const seasonsData = Array.from({length: 20}, (_, i) => {
        const seasonNum = i + 1;
        const seasonVal = `s${seasonNum}`;
        return {
            label: `Season ${seasonNum}`,
            value: seasonVal,
            episodes: Array.from({length: 24}, (_, j) => {
                const episodeNum = j + 1;
                const episodeVal = `${seasonVal}e${episodeNum}`;
                return {
                    label: `Episode ${episodeNum}`,
                    value: episodeVal,
                    src: VIDEO_SRC || undefined,
                    voiceovers: voiceoverOptions.map((vo) => ({
                        ...vo,
                        src: VIDEO_SRC || undefined,
                    })),
                };
            }),
        };
    });

    export const App: FC = () => {
    const [season, setSeason] = useState('s1');
    const [episode, setEpisode] = useState('s1e1');
    const [voiceover, setVoiceover] = useState('ru');

    return (
        <>
            <header className="page-header">
                <a href={BASE_URL} className="page-header__brand">
                    <span className="page-header__logo"><img src={logoSrc} alt="evade-player" style={{width: 22, height: 22}}/></span>
                    evade-player
                </a>
                <nav className="page-header__links">
                    <span className="page-header__badge">
                        v{version}
                    </span>
                    <a
                        href="https://github.com/evadepw/evade-player"
                        className="page-header__star"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Star on GitHub
                    </a>
                    <a
                        href="https://github.com/evadepw/evade-player"
                        className="page-header__link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="page-header__link-label">GitHub</span>
                    </a>
                </nav>
            </header>

            <main className="page-main">
                <section className="hero">
                    <div className="hero__tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        React &middot; Video.js v10
                    </div>
                    <h1 className="hero__title">
                        A modern video player<br/>
                        <span className="hero__title-accent">built with Video.js</span>
                    </h1>
                    <p className="hero__subtitle">
                        HLS streaming, accessible controls, audio processing, content navigation, and fragment skip support — available as a React component or a framework-agnostic Web Component.
                    </p>
                    <div className="hero__actions">
                        <a
                            href="https://github.com/evadepw/evade-player/blob/main/README.md"
                            className="hero__btn hero__btn--primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalIcon/> Read the docs
                        </a>
                        <a
                            href="https://github.com/evadepw/evade-player"
                            className="hero__btn hero__btn--secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <GithubIcon/> GitHub
                        </a>
                    </div>
                </section>

                <section className="player-section">
                    <div className="player-section__inner">
                        <div className="player-section__label">
                            <span className="player-section__label-dot"/>
                            Live demo
                        </div>
                        <div className="player-section__player">
                            {VIDEO_SRC ? (
                                <VideoPlayer
                                    src={VIDEO_SRC}
                                    poster={POSTER_SRC || undefined}
                                    thumbnailStoryboardSrc={THUMBNAIL_STORYBOARD_SRC || undefined}
                                    seasons={seasonsData}
                                    fragments={[
                                        {type: 'opening', startTime: 0, endTime: 90},
                                        {type: 'ending', startTime: 584, endTime: 634},
                                        {type: 'preview', startTime: 140, endTime: 150},
                                    ]}
                                    currentSeason={season}
                                    currentEpisode={episode}
                                    currentVoiceover={voiceover}
                                    onSeasonChange={setSeason}
                                    onEpisodeChange={setEpisode}
                                    onVoiceoverChange={setVoiceover}
                                    onSaveState={() => {}}
                                    locale="en"
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 400,
                                    borderRadius: 32,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: '#666680',
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    padding: '2rem',
                                }}>
                                    <div>
                                        <p style={{margin: '0 0 0.5rem', fontWeight: 600}}>No video source configured</p>
                                        <p style={{margin: 0, fontSize: '0.75rem'}}>
                                            Set <code style={{color: '#a078ff'}}>VITE_VIDEO_SRC</code> in your <code style={{color: '#a078ff'}}>.env</code> file or use the
                                            web component build.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="features">
                    {features.map((feature) => (
                        <div key={feature.title} className="feature-card">
                            <div className="feature-card__icon">{feature.icon}</div>
                            <h3 className="feature-card__title">{feature.title}</h3>
                            <p className="feature-card__desc">{feature.description}</p>
                        </div>
                    ))}
                </section>
            </main>

            <footer className="page-footer">
                <span>evade-player &mdash; MIT License</span>
                <div className="page-footer__links">
                    <a
                        href="https://github.com/evadepw/evade-player"
                        className="page-footer__link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://www.npmjs.com/package/evade-player"
                        className="page-footer__link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        npm
                    </a>
                    <a
                        href="https://github.com/leo-need-more-coffee/evadeplayer-platform"
                        className="page-footer__link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Backend
                    </a>
                </div>
            </footer>
        </>
    );
};
