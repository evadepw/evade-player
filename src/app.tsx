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
            />
        </div>
    );
};
