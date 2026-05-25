import type { FC } from 'react';
import { VideoPlayer } from './skins/default/skin.tsx';

const VIDEO_PROVIDER_HOST = import.meta.env.VITE_VIDEO_PROVIDER_HOST ?? 'http://10.88.88.2';
const VIDEO_PROVIDER_PROXY_PATH = import.meta.env.VITE_VIDEO_PROVIDER_PROXY_PATH ?? '/hls-proxy';
const VIDEO_POSTER_PATH = import.meta.env.VITE_VIDEO_POSTER_PATH ?? '/thumbnails';
const DEFAULT_VIDEO_ID = import.meta.env.VITE_DEFAULT_VIDEO_ID ?? '3fb87d2e-b294-4c4e-a937-9be65496e1f7';
const INVALID_MEDIA_SRC = 'invalid://missing-video-id';

interface PlayerUrlParams {
    id: string;
    token: string;
    expires: string;
    codec: string;
}

function getPlayerUrlParams(): PlayerUrlParams {
    if (typeof window === 'undefined') {
        return {
            id: DEFAULT_VIDEO_ID,
            token: '',
            expires: '',
            codec: ''
        };
    }

    const search = new URLSearchParams(window.location.search);
    return {
        id: search.get('id') ?? DEFAULT_VIDEO_ID,
        token: search.get('token') ?? '',
        expires: search.get('expires') ?? '',
        codec: search.get('codec') ?? ''
    };
}

function buildVideoSrc(videoId: string, token: string, expires: string, codec: string): string {
    const host = VIDEO_PROVIDER_HOST.replace(/\/$/, '');
    const proxyPath = VIDEO_PROVIDER_PROXY_PATH.replace(/\/$/, '');
    const params = new URLSearchParams();

    if (token) params.set('token', token);
    if (expires) params.set('expires', expires);
    if (codec) params.set('codec', codec);

    const query = params.toString();
    return `${host}${proxyPath}/${videoId}/master.m3u8${query ? `?${query}` : ''}`;
}

function buildPosterSrc(videoId: string): string {
    const host = VIDEO_PROVIDER_HOST.replace(/\/$/, '');
    const posterPath = VIDEO_POSTER_PATH.replace(/\/$/, '');
    return `${host}${VIDEO_PROVIDER_PROXY_PATH}${posterPath}/${videoId}/preview.jpg`;
}

export const App: FC = () => {
    const { id: videoId, token, expires, codec } = getPlayerUrlParams();
    const missingVideoId = !videoId;
    const resolvedVideoId = videoId || DEFAULT_VIDEO_ID;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <VideoPlayer
                src={missingVideoId ? INVALID_MEDIA_SRC : buildVideoSrc(resolvedVideoId, token, expires, codec)}
                poster={missingVideoId ? undefined : buildPosterSrc(resolvedVideoId)}
                errorDescription={
                    missingVideoId
                        ? 'Missing video id. Open player with ?id=VIDEO_ID in iframe URL.'
                        : undefined
                }
            />
        </div>
    );
};
