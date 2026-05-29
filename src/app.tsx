import type { FC } from 'react';
import { VideoPlayer } from './skins/default/skin.tsx';

const VIDEO_SRC = import.meta.env.VITE_VIDEO_SRC ?? '';
const POSTER_SRC = import.meta.env.VITE_POSTER_SRC ?? '';
const THUMBNAIL_STORYBOARD_SRC = import.meta.env.VITE_THUMBNAIL_STORYBOARD_SRC ?? '';

export const App: FC = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <VideoPlayer
                src={VIDEO_SRC}
                poster={POSTER_SRC || undefined}
                thumbnailStoryboardSrc={THUMBNAIL_STORYBOARD_SRC || undefined}
                seasons={[
                    {
                        label: 'Season 1',
                        value: 's1',
                        episodes: [
                            { label: 'Episode 1', value: 's1e1' },
                            { label: 'Episode 2', value: 's1e2' },
                        ],
                    },
                    {
                        label: 'Season 2',
                        value: 's2',
                        episodes: [
                            { label: 'Episode 1', value: 's2e1' },
                        ],
                    },
                ]}
                currentSeason="s1"
                currentEpisode="s1e1"
                onSeasonChange={(value) => console.log('Season:', value)}
                onEpisodeChange={(value) => console.log('Episode:', value)}
                voiceovers={[
                    { label: 'Russian', value: 'ru' },
                    { label: 'English', value: 'en' },
                    { label: 'Japanese', value: 'ja' },
                ]}
                currentVoiceover="ru"
                onVoiceoverChange={(value) => console.log('Voiceover:', value)}
            />
        </div>
    );
};
