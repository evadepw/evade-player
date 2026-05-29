import type { FC } from 'react';
import { VideoPlayer } from './skins/default/skin.tsx';

const VIDEO_SRC = import.meta.env.VITE_VIDEO_SRC ?? '';
const POSTER_SRC = import.meta.env.VITE_POSTER_SRC ?? '';
const THUMBNAIL_STORYBOARD_SRC = import.meta.env.VITE_THUMBNAIL_STORYBOARD_SRC ?? '';

const voiceoverOptions = [
    {label: 'Russian', value: 'ru'},
    {label: 'English', value: 'en'},
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

export const App: FC = () => {
    return (
        <div style={{ width: '50%', height: '50%', margin: 'auto', marginTop: '15%' }}>
            <VideoPlayer
                src={VIDEO_SRC}
                poster={POSTER_SRC || undefined}
                thumbnailStoryboardSrc={THUMBNAIL_STORYBOARD_SRC || undefined}
                seasons={Array.from({length: 20}, (_, i) => ({
                    label: `Season ${i + 1}`,
                    value: `s${i + 1}`,
                    episodes: Array.from({length: 24}, (_, j) => ({
                        label: `Episode ${j + 1}`,
                        value: `s${i + 1}e${j + 1}`,
                        voiceovers: voiceoverOptions,
                    })),
                }))}
                fragments={[
                    { type: 'opening', startTime: 0, endTime: 90 },
                    { type: 'ending', startTime: 584, endTime: 634 },
                    { type: 'preview', startTime: 140, endTime: 150 },
                ]}
                currentSeason="s1"
                currentEpisode="s1e1"
                currentVoiceover="ru"
                onSeasonChange={() => {}}
                onEpisodeChange={() => {}}
                onVoiceoverChange={() => {}}
                onSaveState={() => {}}
                locale="ru"
            />
        </div>
    );
};
