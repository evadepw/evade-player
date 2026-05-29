export { VideoPlayer } from './skins/default/skin';
export type { VideoPlayerProps } from './skins/default/skin';

export { Player } from './skins/default/player';

export type {
  QualityOption,
  SeasonOption,
  EpisodeOption,
  VoiceoverOption,
  PlaybackState,
  PlayerSettings,
  SubtitleOption,
  AudioOption,
  SubtitleAppearance,
  SubtitleSettingOption,
  SubtitleSettingsView,
  SettingsView,
} from './skins/default/types';

export {
  VOLUME_BOOST_OPTIONS,
  NORMALIZATION_OPTIONS,
  DEFAULT_VOLUME_BOOST,
  DEFAULT_NORMALIZATION,
  DEFAULT_SUBTITLE_APPEARANCE,
  SUBTITLE_FONT_SIZE_OPTIONS,
  SUBTITLE_COLOR_OPTIONS,
  SUBTITLE_BG_OPTIONS,
  SUBTITLE_EDGE_STYLE_OPTIONS,
  SUBTITLE_FONT_FAMILY_OPTIONS,
  SUBTITLE_POSITION_OPTIONS,
} from './skins/default/types';

export {
  savePlaybackState,
  loadPlaybackState,
  clearPlaybackState,
} from './skins/default/utils/playback-state';

export {
  savePlayerSettings,
  loadPlayerSettings,
  clearPlayerSettings,
} from './skins/default/utils/settings-persistence';

export {
  applyVolumeBoost,
  applyNormalization,
  resumeOnUserInteraction,
  setMediaElement,
  getAudioChainDebugInfo,
} from './skins/default/components/audio-chain';
export type { AudioChainDebugInfo } from './skins/default/components/audio-chain';
