'use client';

import {createPlayer} from '@videojs/react';
import {videoFeatures} from '@videojs/react/video';
import {bufferFeature, sourceFeature, textTrackFeature} from '@videojs/react';

export const Player = createPlayer({features: [...videoFeatures, bufferFeature, sourceFeature, textTrackFeature]});
