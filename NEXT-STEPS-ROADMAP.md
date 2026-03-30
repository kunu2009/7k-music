# 7K Music — Next Steps Roadmap

## Product goals
- Make playback highly reliable across web + PWA.
- Improve UI/UX quality and responsiveness on all screen sizes.
- Add personalization, smart playlists, and recommendation quality.
- Strengthen offline experience while staying legally compliant.

## Important legal note (must keep)
- Since this app streams from YouTube, full offline song file downloads are generally not allowed through YouTube embed/API flows.
- Safe offline scope:
  - Cache app shell and static assets.
  - Cache thumbnails and metadata.
  - Cache user data (favorites, playlists, history, settings).
  - Optional: allow offline playback only for user-owned/local files in My Music.

## P0 — Must ship first

### 1) Playback reliability
- [ ] Finalize robust player init lifecycle (API ready, player ready, route transitions).
- [ ] Add automatic retry/fallback when a video is embed-restricted.
- [ ] Improve queue behavior on errors (skip + toast + log).
- [ ] Persist playback state (current track, queue, position) for resume.
- [ ] Add clear loading/buffering/error states in mini and now-playing player.

### 2) PWA stability
- [ ] Verify service worker lifecycle (install, activate, update prompt).
- [ ] Add offline fallback page for no-network situations.
- [ ] Version cache strategy and safe cache invalidation on deploy.
- [ ] Add install education for Android and desktop.

### 3) Responsive UI baseline
- [ ] Define breakpoints for nav, cards, mini-player, now-playing layout.
- [ ] Improve touch targets and spacing for small devices.
- [ ] Ensure now-playing video area scales correctly in portrait/landscape.
- [ ] Validate safe areas for notches/home indicators.

## P1 — High impact next

### 4) Micro-interactions and polish
- [ ] Add subtle feedback for play/pause/favorite/add-to-playlist actions.
- [ ] Add skeleton loaders for video grids and search results.
- [ ] Add smoother progress/seek interaction with low-latency feedback.
- [ ] Add haptic-style visual cues (mobile-friendly tap states).

### 5) Better playlist UX
- [ ] Replace prompt-based add-to-playlist with proper modal/bottom sheet.
- [ ] Quick create playlist inline while adding a track.
- [ ] Multi-select add/remove tracks.
- [ ] Drag-and-drop reorder in playlist.
- [ ] Playlist cover image generation from top tracks.

### 6) Offline-first data layer
- [ ] Cache last successful Home and Search result sets.
- [ ] Show cached content immediately, then refresh in background.
- [ ] Add stale-while-revalidate behavior for metadata APIs.
- [ ] Add storage management UI (cache size, clear cache, offline status).

## P2 — Personalization and intelligence

### 7) Onboarding and taste capture
- [ ] First-run onboarding: genres, artists, language, mood, energy.
- [ ] Build preference profile in local storage/DB.
- [ ] Ask lightweight preference updates over time (not intrusive).

### 8) Smart playlists and auto-grouping
- [ ] Auto-group by artist.
- [ ] Auto-group by mood (chill/workout/focus/party).
- [ ] Auto-group by era/tempo when metadata is available.
- [ ] “Recently loved” and “rediscover” dynamic playlists.

### 9) Recommendation system (progressive rollout)
- [ ] Rule-based recommender v1:
  - Based on favorites + recent plays + skips.
- [ ] Similar-track expansion using related-video graph.
- [ ] Diversity controls (avoid same artist repetition).
- [ ] Feedback loop (like/dislike/skip weight updates).

## P3 — Advanced enhancements

### 10) Rich PWA playback experience
- [ ] Media Session API metadata + lock-screen controls.
- [ ] Hardware media key support.
- [ ] Background playback behavior validation in installed mode.
- [ ] Better reconnect behavior when network drops/restores.

### 11) Accessibility and quality
- [ ] Keyboard navigation for core flows.
- [ ] Focus states and contrast checks.
- [ ] Screen reader labels for all player controls.
- [ ] Reduce motion preference support.

### 12) Performance and observability
- [ ] Bundle split for route-level code loading.
- [ ] Image optimization and lazy loading improvements.
- [ ] Web vitals tracking (LCP, INP, CLS).
- [ ] Error analytics for playback and API failures.

## Suggested milestone plan
- Milestone 1 (1-2 weeks): P0 playback + PWA stability + responsive baseline.
- Milestone 2 (1-2 weeks): P1 micro-interactions + playlist UX + offline-first data.
- Milestone 3 (2-3 weeks): P2 onboarding + smart playlists + recommender v1.
- Milestone 4 (ongoing): P3 polish, accessibility, and performance tuning.

## Definition of done checklist (for every feature)
- [ ] Works on desktop + mobile web.
- [ ] Works in installed PWA mode.
- [ ] Handles offline/poor network gracefully.
- [ ] Meets accessibility basics.
- [ ] Has analytics or logs for failure visibility.
- [ ] Includes QA test cases and release notes.
