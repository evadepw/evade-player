# Changelog

## [0.1.2] — 2026-05-29

### Added
- Playback state management — saves/restores position, season, episode, voiceover per source
- Resume prompt — "Continue from X?" overlay on returning to a partially-watched video
- Season, episode, and voiceover selectors in the top-right corner
- Content navigation callbacks (`onSeasonChange`, `onEpisodeChange`, `onVoiceoverChange`)
- `savedState` and `onSaveState` props for external state control

### Changed
- Refactored video source management — unified HLS/regular video handling

### Fixed
- Environment variable name in npm publish workflow

## [0.1.1] — 2026-05-2

### Added
- Audio settings menu with volume boost (50–300%) and normalization (off/light/medium/strong)
- Subtitle appearance customization — font size, text color, background, edge style, font family, position
- Subtitle position settings with four presets (low, default, high, very high)
- Settings menu with quality, subtitles, speed, and audio submenus
- Button component for player controls
- Environment variables for demo configuration

### Changed
- Refactored audio chain management into a singleton Web Audio API manager
- Renamed project to `evade-player`

### Fixed
- Type casting for media element extraction in audio chain

## [0.1.0] — 2026-05-26

### Added
- Initial release
- React 19 + Video.js v10 player with HLS streaming
- Accessible controls (keyboard, screen reader, focus management)
- Picture-in-picture, fullscreen, and Cast support
- Thumbnail storyboard previews on timeline
- Hotkeys and gesture support
- Audio volume boost and dynamic range compression via Web Audio API
- Pluggable skin system
- Docker development environment
- GitHub Actions workflow for npm publishing
- MIT License
