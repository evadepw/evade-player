# Changelog

## [0.1.3] — 2026-05-29

### Fixed
- Standalone work

## [0.1.2] — 2026-05-29

### Added
- Playback state management — saves/restores position, season, episode, voiceover per source
- Resume prompt — "Continue from X?" overlay on returning to a partially-watched video
- Season, episode, and voiceover selectors in the top-right corner
- Content navigation callbacks (`onSeasonChange`, `onEpisodeChange`, `onVoiceoverChange`)
- `savedState` and `onSaveState` props for external state control
- `locale` prop for `VideoPlayer` with Russian and English translations
- Fragment segments (Opening, Ending, Preview, Recap) — colored markers on the timeline
- Skip fragment button — appears when playback enters a fragment, seeks past it
- Auto-skip settings per fragment type in the settings menu
- Fragment settings persisted in localStorage
- `fragmentSettings` prop for external configuration of auto-skip defaults

### Changed
- Refactored video source management — unified HLS/regular video handling
- `currentSeason` is now optional — derived from `currentEpisode` (`s1e1` → `s1`) when not provided
- Settings menu, subtitle settings, error dialog, and resume prompt now use localized strings
- Subtitle settings refactored with centralized option views and localized labels
- Removed debug logging from VolumeProcessor

### Fixed
- Environment variable name in npm publish workflow
- Fragment settings no longer trigger full player re-render (moved to context-based state)

## [0.1.1] — 2026-05-27

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

[0.1.3]: https://github.com/Alukkart/evade-player/releases/tag/0.1.3
[0.1.2]: https://github.com/Alukkart/evade-player/releases/tag/0.1.2
[0.1.1]: https://github.com/Alukkart/evade-player/releases/tag/0.1.1
[0.1.0]: https://github.com/Alukkart/evade-player/releases/tag/0.1.0
