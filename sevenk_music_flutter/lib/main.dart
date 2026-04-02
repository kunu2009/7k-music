import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await JustAudioBackground.init(
    androidNotificationChannelId: 'com.sevenkmusic.player.channel.audio',
    androidNotificationChannelName: '7K Music Playback',
    androidNotificationOngoing: true,
  );

  runApp(const SevenKMusicApp());
}

class DemoTrack {
  const DemoTrack({
    required this.id,
    required this.title,
    required this.artist,
    required this.audioUrl,
    required this.artUrl,
    required this.lyrics,
  });

  final String id;
  final String title;
  final String artist;
  final String audioUrl;
  final String artUrl;
  final String lyrics;
}

class DemoPlaylist {
  const DemoPlaylist({
    required this.id,
    required this.name,
    required this.description,
    required this.tracks,
  });

  final String id;
  final String name;
  final String description;
  final List<DemoTrack> tracks;
}

const allTracks = <DemoTrack>[
  DemoTrack(
    id: '1',
    title: 'Neon Horizon',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    lyrics:
        'Neon lights in midnight rain\nHold me close in purple haze\nEvery heartbeat feels alive\nWe are echoes in the sky',
  ),
  DemoTrack(
    id: '2',
    title: 'Night Pulse',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    lyrics:
        'City drums are calling out\nCrowded rooms and flashing sounds\nStay with me until sunrise\nFeel the rush behind our eyes',
  ),
  DemoTrack(
    id: '3',
    title: 'Blue Drift',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600',
    lyrics:
        'Falling slow through open air\nSilver dust is everywhere\nBlue horizon, quiet glow\nTake me where the wild winds go',
  ),
  DemoTrack(
    id: '4',
    title: 'Electric Bloom',
    artist: 'Afterline',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    lyrics:
        'Static flowers in the dark\nTiny sparks become a fire\nTouch the rhythm, touch the wire\nRise with me and climb higher',
  ),
  DemoTrack(
    id: '5',
    title: 'Afterglow Drive',
    artist: 'Nova Miles',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    artUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600',
    lyrics:
        'Highway lines and amber skies\nRadio sparks in your eyes\nRoll the windows, breathe the night\nKeep the afterglow in sight',
  ),
];

final demoPlaylists = <DemoPlaylist>[
  DemoPlaylist(
    id: 'pl-1',
    name: 'Night Ride',
    description: 'Cinematic synth for late drives',
    tracks: [allTracks[0], allTracks[4], allTracks[1]],
  ),
  DemoPlaylist(
    id: 'pl-2',
    name: 'Focus Waves',
    description: 'Low-distraction atmosphere',
    tracks: [allTracks[2], allTracks[0], allTracks[3]],
  ),
  DemoPlaylist(
    id: 'pl-3',
    name: 'Live Energy',
    description: 'Bigger drums, bigger choruses',
    tracks: [allTracks[3], allTracks[1], allTracks[4]],
  ),
];

class SevenKMusicApp extends StatelessWidget {
  const SevenKMusicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: '7K Music Player',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050814),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF8AAFFF),
          secondary: Color(0xFFA9BFFF),
          surface: Color(0xFF111A33),
        ),
      ),
      home: const SevenKMusicShell(),
    );
  }
}

class SevenKMusicShell extends StatefulWidget {
  const SevenKMusicShell({super.key});

  @override
  State<SevenKMusicShell> createState() => _SevenKMusicShellState();
}

class _SevenKMusicShellState extends State<SevenKMusicShell> {
  late final AudioPlayer _player;
  final TextEditingController _discoverSearchController = TextEditingController();

  static const String _prefsCurrentTabKey = 'sevenk.currentTab.v1';
  static const String _prefsActivePlaylistKey = 'sevenk.activePlaylist.v1';
  static const String _prefsQueueOrderKey = 'sevenk.queueOrder.v1';
  static const String _prefsRecentSearchesKey = 'sevenk.recentSearches.v1';
  static const String _prefsDownloadedTracksKey = 'sevenk.downloadedTrackIds.v1';

  int _currentTab = 0;
  int _trackIndex = 0;
  List<DemoTrack> _queue = List.of(allTracks);
  String? _activePlaylistId;
  String _discoverQuery = '';
  final List<String> _recentDiscoverSearches = <String>[];
  final Set<String> _downloadedTrackIds = <String>{};
  final Map<String, List<DemoTrack>> _playlistTracks = {
    for (final playlist in demoPlaylists) playlist.id: List<DemoTrack>.of(playlist.tracks),
  };

  LoopMode _loopMode = LoopMode.off;
  bool _shuffleEnabled = false;
  bool _loadingSource = true;
  bool _lyricsExpanded = true;
  SharedPreferences? _prefs;
  

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _init();
  }

  Future<void> _init() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

    _prefs = await SharedPreferences.getInstance();
    await _restoreUiState();

    await _loadQueue(initialIndex: 0, autoPlay: false);
    _player.currentIndexStream.listen((index) {
      if (!mounted || index == null) return;
      setState(() => _trackIndex = index);
    });

    _player.loopModeStream.listen((mode) {
      if (!mounted) return;
      setState(() => _loopMode = mode);
    });

    _player.shuffleModeEnabledStream.listen((enabled) {
      if (!mounted) return;
      setState(() => _shuffleEnabled = enabled);
    });
  }

  Future<void> _loadQueue({required int initialIndex, required bool autoPlay}) async {
    setState(() => _loadingSource = true);

    final source = ConcatenatingAudioSource(
      children: _queue
          .map(
            (track) => AudioSource.uri(
              Uri.parse(track.audioUrl),
              tag: MediaItem(
                id: track.id,
                title: track.title,
                artist: track.artist,
                artUri: Uri.parse(track.artUrl),
              ),
            ),
          )
          .toList(),
    );

    await _player.setAudioSource(source, initialIndex: initialIndex);
    if (autoPlay) {
      await _player.play();
    }

    if (mounted) {
      setState(() {
        _trackIndex = initialIndex;
        _loadingSource = false;
      });
    }
  }

  DemoTrack get _currentTrack => _queue[_trackIndex.clamp(0, _queue.length - 1)];

  DemoTrack? _trackFromId(String id) {
    for (final track in allTracks) {
      if (track.id == id) return track;
    }
    return null;
  }

  Future<void> _restoreUiState() async {
    final prefs = _prefs;
    if (prefs == null) return;

    setState(() {
      _currentTab = prefs.getInt(_prefsCurrentTabKey) ?? 0;

      final recentSearches = prefs.getStringList(_prefsRecentSearchesKey) ?? const <String>[];
      _recentDiscoverSearches
        ..clear()
        ..addAll(recentSearches);

      final downloadedIds = prefs.getStringList(_prefsDownloadedTracksKey) ?? const <String>[];
      _downloadedTrackIds
        ..clear()
        ..addAll(downloadedIds);

      _activePlaylistId = prefs.getString(_prefsActivePlaylistKey);

      final queueIds = prefs.getStringList(_prefsQueueOrderKey);
      if (queueIds != null && queueIds.isNotEmpty) {
        final restoredQueue = <DemoTrack>[];
        for (final id in queueIds) {
          final track = _trackFromId(id);
          if (track != null) {
            restoredQueue.add(track);
          }
        }
        if (restoredQueue.isNotEmpty) {
          _queue = restoredQueue;
        }
      }

      if (_queue.isEmpty) {
        _queue = List<DemoTrack>.of(allTracks);
      }
    });
  }

  Future<void> _persistUiState() async {
    final prefs = _prefs;
    if (prefs == null) return;

    await prefs.setInt(_prefsCurrentTabKey, _currentTab);
    if (_activePlaylistId == null) {
      await prefs.remove(_prefsActivePlaylistKey);
    } else {
      await prefs.setString(_prefsActivePlaylistKey, _activePlaylistId!);
    }
    await prefs.setStringList(_prefsQueueOrderKey, _queue.map((track) => track.id).toList());
    await prefs.setStringList(_prefsRecentSearchesKey, _recentDiscoverSearches);
    await prefs.setStringList(_prefsDownloadedTracksKey, _downloadedTrackIds.toList());
  }

  List<DemoTrack> _tracksForPlaylist(DemoPlaylist playlist) {
    return _playlistTracks[playlist.id] ?? playlist.tracks;
  }

  List<DemoTrack> get _downloadedTracks {
    return allTracks.where((track) => _downloadedTrackIds.contains(track.id)).toList();
  }

  Future<void> _playTrackInQueue(int index) async {
    if (index < 0 || index >= _queue.length) return;
    await _player.seek(Duration.zero, index: index);
    await _player.play();
  }

  Future<void> _playFromPlaylist(DemoPlaylist playlist, int index) async {
    final tracks = _tracksForPlaylist(playlist);
    if (tracks.isEmpty) return;
    final safeIndex = index.clamp(0, tracks.length - 1);
    final selected = tracks[safeIndex];
    _activePlaylistId = playlist.id;
    _queue = List<DemoTrack>.of(tracks);
    final initialIndex = _queue.indexWhere((track) => track.id == selected.id);
    await _persistUiState();
    await _loadQueue(initialIndex: initialIndex < 0 ? 0 : initialIndex, autoPlay: true);
  }

  Future<void> _openPlaylistDetail(DemoPlaylist playlist) async {
    final result = await Navigator.of(context).push<_PlaylistDetailResult>(
      MaterialPageRoute(
        builder: (_) => PlaylistDetailScreen(playlist: playlist),
      ),
    );

    if (!mounted || result == null) {
      return;
    }

    _activePlaylistId = playlist.id;
    _queue = List<DemoTrack>.of(result.tracks);
    await _persistUiState();
    await _loadQueue(initialIndex: result.startIndex, autoPlay: true);
  }

  Future<void> _toggleRepeatMode() async {
    if (_loopMode == LoopMode.off) {
      await _player.setLoopMode(LoopMode.all);
      return;
    }
    if (_loopMode == LoopMode.all) {
      await _player.setLoopMode(LoopMode.one);
      return;
    }
    await _player.setLoopMode(LoopMode.off);
  }

  Future<void> _toggleShuffleMode() async {
    final target = !_shuffleEnabled;
    await _player.setShuffleModeEnabled(target);
    if (target) {
      await _player.shuffle();
    }
  }

  void _applyDiscoverSearch(String value, {bool addToRecent = false}) {
    final normalized = value.trim();
    setState(() {
      _discoverQuery = normalized;
      _discoverSearchController.value = TextEditingValue(
        text: normalized,
        selection: TextSelection.collapsed(offset: normalized.length),
      );

      if (addToRecent && normalized.isNotEmpty) {
        _recentDiscoverSearches.removeWhere(
          (entry) => entry.toLowerCase() == normalized.toLowerCase(),
        );
        _recentDiscoverSearches.insert(0, normalized);
        if (_recentDiscoverSearches.length > 5) {
          _recentDiscoverSearches.removeRange(5, _recentDiscoverSearches.length);
        }
      }
    });
    if (addToRecent && normalized.isNotEmpty) {
      _persistUiState();
    }
  }

  List<String> _discoverSuggestions(String query) {
    final normalized = query.trim().toLowerCase();
    final source = <String>[
      ..._recentDiscoverSearches,
      ...demoPlaylists.map((playlist) => playlist.name),
      ...allTracks.map((track) => track.title),
      ...allTracks.map((track) => track.artist),
      'Night drive',
      'Focus mix',
      'Workout energy',
      'Chill vibes',
    ];

    final seen = <String>{};
    final filtered = <String>[];
    for (final item in source) {
      final candidate = item.trim();
      if (candidate.isEmpty) continue;
      final lower = candidate.toLowerCase();
      if (seen.contains(lower)) continue;
      if (normalized.isNotEmpty && !lower.contains(normalized)) continue;
      seen.add(lower);
      filtered.add(candidate);
      if (filtered.length >= 8) break;
    }
    return filtered;
  }

  Future<void> _addToQueueNext(DemoTrack track) async {
    final existingIndex = _queue.indexWhere((item) => item.id == track.id);
    final current = _trackIndex;

    if (existingIndex == current || existingIndex == current + 1) {
      return;
    }

    final mutable = List<DemoTrack>.of(_queue);
    if (existingIndex >= 0) {
      mutable.removeAt(existingIndex);
    }
    final insertIndex = (current + 1).clamp(0, mutable.length);
    mutable.insert(insertIndex, track);

    final currentId = _currentTrack.id;
    _queue = mutable;
    final nextCurrentIndex = _queue.indexWhere((item) => item.id == currentId);
    await _persistUiState();
    await _loadQueue(initialIndex: nextCurrentIndex < 0 ? 0 : nextCurrentIndex, autoPlay: _player.playing);
  }

  Future<void> _addToQueue(DemoTrack track) async {
    final exists = _queue.any((item) => item.id == track.id);
    if (exists) return;

    final updated = [..._queue, track];
    final currentId = _currentTrack.id;
    _queue = updated;

    final nextCurrentIndex = _queue.indexWhere((item) => item.id == currentId);
    await _persistUiState();
    await _loadQueue(initialIndex: nextCurrentIndex < 0 ? 0 : nextCurrentIndex, autoPlay: _player.playing);
  }

  Future<void> _removeFromQueue(int index) async {
    if (_queue.length <= 1 || index < 0 || index >= _queue.length) {
      return;
    }

    final mutable = List<DemoTrack>.of(_queue);
    final currentId = _currentTrack.id;
    mutable.removeAt(index);
    _queue = mutable;

    var nextIndex = _queue.indexWhere((item) => item.id == currentId);
    if (nextIndex < 0) {
      nextIndex = index.clamp(0, _queue.length - 1);
    }

    await _persistUiState();
    await _loadQueue(initialIndex: nextIndex, autoPlay: _player.playing);
  }

  Future<void> _reorderQueue(int oldIndex, int newIndex) async {
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    if (oldIndex == newIndex) return;

    final currentId = _currentTrack.id;
    final mutable = List<DemoTrack>.of(_queue);
    final moved = mutable.removeAt(oldIndex);
    mutable.insert(newIndex, moved);
    _queue = mutable;

    final nextCurrentIndex = _queue.indexWhere((item) => item.id == currentId);
    await _persistUiState();
    await _loadQueue(initialIndex: nextCurrentIndex < 0 ? 0 : nextCurrentIndex, autoPlay: _player.playing);
  }

  void _toggleOffline(DemoTrack track) {
    setState(() {
      if (_downloadedTrackIds.contains(track.id)) {
        _downloadedTrackIds.remove(track.id);
      } else {
        _downloadedTrackIds.add(track.id);
      }
    });
    _persistUiState();
  }

  Widget _heroCard() {
    return Container(
      height: 210,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(colors: [Color(0xFF152B5A), Color(0xFF28458C)]),
        boxShadow: const [BoxShadow(color: Color(0x6024448D), blurRadius: 28, spreadRadius: 4)],
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(_currentTrack.title, style: GoogleFonts.sora(fontSize: 24, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(_currentTrack.artist, style: const TextStyle(color: Color(0xFFC7D6F3))),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => _playTrackInQueue(_trackIndex),
                    icon: const Icon(Icons.play_arrow_rounded),
                    label: const Text('Play Now'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFE8EFFF),
                      foregroundColor: const Color(0xFF172955),
                    ),
                  ),
                ],
              ),
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(26),
            child: Image.network(_currentTrack.artUrl, width: 145, height: 210, fit: BoxFit.cover),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoverPage() {
    final normalized = _discoverQuery.trim().toLowerCase();
    final filteredTracks = normalized.isEmpty
        ? allTracks
        : allTracks
            .where(
              (track) =>
                  track.title.toLowerCase().contains(normalized) ||
                  track.artist.toLowerCase().contains(normalized),
            )
            .toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Discover', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        const Text('Curated for your daily listening sessions', style: TextStyle(color: Color(0xFFB7C7EB))),
        const SizedBox(height: 18),
        _heroCard(),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            color: const Color(0x261A2B54),
            border: Border.all(color: const Color(0x2FAFC2FF)),
          ),
          child: TextField(
            controller: _discoverSearchController,
            onChanged: (value) => setState(() => _discoverQuery = value),
            onSubmitted: (value) => _applyDiscoverSearch(value, addToRecent: true),
            style: const TextStyle(color: Color(0xFFE6EEFF)),
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFC3D2F5)),
              suffixIcon: _discoverQuery.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _discoverSearchController.clear();
                        setState(() => _discoverQuery = '');
                      },
                      icon: const Icon(Icons.close_rounded, color: Color(0xFFC3D2F5)),
                    ),
              hintText: 'Search songs or artists',
              hintStyle: const TextStyle(color: Color(0xFF93A6D1)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 22),
        if (_recentDiscoverSearches.isNotEmpty) ...[
          Text('Recent Searches', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recentDiscoverSearches
                .map(
                  (term) => ActionChip(
                    label: Text(term),
                    onPressed: () => _applyDiscoverSearch(term),
                    backgroundColor: const Color(0x281A2B54),
                    labelStyle: const TextStyle(color: Color(0xFFE6EEFF)),
                    side: const BorderSide(color: Color(0x2FAFC2FF)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 18),
        ],
        Text('Suggestions', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _discoverSuggestions(_discoverQuery)
              .map(
                (term) => ActionChip(
                  label: Text(term),
                  onPressed: () => _applyDiscoverSearch(term, addToRecent: true),
                  backgroundColor: const Color(0x281A2B54),
                  labelStyle: const TextStyle(color: Color(0xFFE6EEFF)),
                  side: const BorderSide(color: Color(0x2FAFC2FF)),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        if (_discoverQuery.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${filteredTracks.length} results for "${_discoverQuery.trim()}"',
              style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12),
            ),
          ),
        Text('Trending Playlists', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...demoPlaylists.map((playlist) {
          final art = playlist.tracks.first.artUrl;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              color: const Color(0x261A2B54),
              border: Border.all(color: const Color(0x2FAFC2FF)),
            ),
            child: ListTile(
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(art, width: 52, height: 52, fit: BoxFit.cover),
              ),
              title: Text(playlist.name, maxLines: 1, overflow: TextOverflow.ellipsis),
              subtitle: Text(playlist.description, maxLines: 1, overflow: TextOverflow.ellipsis),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
              onTap: () => _openPlaylistDetail(playlist),
            ),
          );
        }),
        const SizedBox(height: 26),
        Text('Top Songs', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        if (filteredTracks.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Text(
              'No songs match your search yet.',
              style: TextStyle(color: Color(0xFFB7C7EB)),
            ),
          )
        else
          ...filteredTracks.asMap().entries.map(
                (entry) => _trackRow(
                  track: entry.value,
                  index: _queue.indexWhere((item) => item.id == entry.value.id).clamp(0, _queue.length - 1),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: () => _addToQueueNext(entry.value),
                        icon: const Icon(Icons.queue_music_rounded, color: Color(0xFFC3D2F5)),
                      ),
                      IconButton(
                        onPressed: () => _toggleOffline(entry.value),
                        icon: Icon(
                          _downloadedTrackIds.contains(entry.value.id)
                              ? Icons.download_done_rounded
                              : Icons.download_for_offline_outlined,
                          color: const Color(0xFFC3D2F5),
                        ),
                      ),
                    ],
                  ),
                  subtitleSuffix: _downloadedTrackIds.contains(entry.value.id) ? 'Offline' : null,
                ),
              ),
      ],
    );
  }

  Widget _buildLibraryPage() {
    final activePlaylist = _activePlaylistId == null
        ? demoPlaylists.first
        : demoPlaylists.firstWhere(
            (item) => item.id == _activePlaylistId,
            orElse: () => demoPlaylists.first,
          );

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Library', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: const [
            _InfoPill(label: 'Recent', icon: Icons.history_rounded),
            _InfoPill(label: 'Favorites', icon: Icons.favorite_border_rounded),
            _InfoPill(label: 'Offline', icon: Icons.download_done_rounded),
            _InfoPill(label: 'Podcasts', icon: Icons.podcasts_rounded),
          ],
        ),
        const SizedBox(height: 24),
        Text('Playlists', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...demoPlaylists.map((playlist) {
          final selected = playlist.id == activePlaylist.id;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              color: selected ? const Color(0x3A8AAFFF) : const Color(0x261A2B54),
              border: Border.all(color: selected ? const Color(0x7FAFD0FF) : const Color(0x2FAFC2FF)),
            ),
            child: ListTile(
              onTap: () => _openPlaylistDetail(playlist),
              title: Text(playlist.name),
              subtitle: Text('${playlist.tracks.length} tracks • ${playlist.description}'),
              trailing: IconButton(
                icon: const Icon(Icons.play_arrow_rounded),
                onPressed: () => _playFromPlaylist(playlist, 0),
              ),
            ),
          );
        }),
        const SizedBox(height: 14),
        Text(activePlaylist.name, style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...activePlaylist.tracks.asMap().entries.map((entry) {
          return _trackRow(
            track: entry.value,
            index: entry.key,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: () => _addToQueue(entry.value),
                  icon: const Icon(Icons.queue_music_rounded, color: Color(0xFFC3D2F5)),
                ),
                IconButton(
                  onPressed: () => _toggleOffline(entry.value),
                  icon: Icon(
                    _downloadedTrackIds.contains(entry.value.id)
                        ? Icons.download_done_rounded
                        : Icons.download_for_offline_outlined,
                    color: const Color(0xFFC3D2F5),
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 24),
        Text('Offline Library (Legal-safe)', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        if (_downloadedTracks.isEmpty)
          const Text(
            'No songs saved yet. This section is prepared for local files and legally allowed offline content only.',
            style: TextStyle(color: Color(0xFFB7C7EB)),
          )
        else
          ..._downloadedTracks.asMap().entries.map(
                (entry) => _trackRow(
                  track: entry.value,
                  index: _queue.indexWhere((item) => item.id == entry.value.id).clamp(0, _queue.length - 1),
                  trailing: IconButton(
                    onPressed: () => _toggleOffline(entry.value),
                    icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFC3D2F5)),
                  ),
                  subtitleSuffix: 'Offline',
                ),
              ),
      ],
    );
  }

  Widget _buildNowPlayingPage() {
    final track = _currentTrack;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _glassIcon(Icons.expand_more_rounded),
            Text('Now Playing', style: GoogleFonts.sora(fontWeight: FontWeight.w600)),
            _glassIcon(Icons.more_horiz),
          ],
        ),
        const SizedBox(height: 20),
        Container(
          height: 340,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            image: DecorationImage(image: NetworkImage(track.artUrl), fit: BoxFit.cover),
            boxShadow: const [BoxShadow(color: Color(0x7F223E83), blurRadius: 36, spreadRadius: 6)],
          ),
        ),
        const SizedBox(height: 18),
        Text(track.title, style: GoogleFonts.sora(fontSize: 31, fontWeight: FontWeight.w700)),
        const SizedBox(height: 4),
        Text(track.artist, style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 15)),
        const SizedBox(height: 18),
        StreamBuilder<Duration>(
          stream: _player.positionStream,
          builder: (context, snapshot) {
            final position = snapshot.data ?? Duration.zero;
            final duration = _player.duration ?? const Duration(seconds: 1);
            final max = duration.inMilliseconds.toDouble();
            final value = position.inMilliseconds.clamp(0, duration.inMilliseconds).toDouble();
            return Column(
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: const Color(0xFFE3ECFF),
                    inactiveTrackColor: const Color(0x33FFFFFF),
                    thumbColor: Colors.white,
                    trackHeight: 3,
                  ),
                  child: Slider(
                    min: 0,
                    max: max,
                    value: value,
                    onChanged: (next) => _player.seek(Duration(milliseconds: next.toInt())),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_format(position), style: const TextStyle(color: Color(0xFFBBC8E7))),
                    Text(_format(duration), style: const TextStyle(color: Color(0xFFBBC8E7))),
                  ],
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _glassIcon(
              _shuffleEnabled ? Icons.shuffle_on_rounded : Icons.shuffle_rounded,
              onTap: _toggleShuffleMode,
            ),
            _glassIcon(Icons.skip_previous_rounded, onTap: _player.seekToPrevious),
            StreamBuilder<bool>(
              stream: _player.playingStream,
              builder: (context, snapshot) {
                final isPlaying = snapshot.data ?? false;
                return GestureDetector(
                  onTap: () => isPlaying ? _player.pause() : _player.play(),
                  child: Container(
                    width: 84,
                    height: 84,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [Color(0xFFEAF1FF), Color(0xFFCCD9FF)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                      boxShadow: [BoxShadow(color: Color(0x80A1B9FF), blurRadius: 30, spreadRadius: 4)],
                    ),
                    child: Icon(
                      isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      color: const Color(0xFF1D2A55),
                      size: 46,
                    ),
                  ),
                );
              },
            ),
            _glassIcon(Icons.skip_next_rounded, onTap: _player.seekToNext),
            _glassIcon(_repeatIcon(_loopMode), onTap: _toggleRepeatMode),
          ],
        ),
        const SizedBox(height: 20),
        GestureDetector(
          onTap: () => setState(() => _lyricsExpanded = !_lyricsExpanded),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeOut,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: const Color(0x2B182D57),
              border: Border.all(color: const Color(0x3AAFC2FF)),
            ),
            height: _lyricsExpanded ? 220 : 60,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Lyrics', style: GoogleFonts.sora(fontWeight: FontWeight.w600)),
                    Icon(_lyricsExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded),
                  ],
                ),
                const SizedBox(height: 10),
                if (_lyricsExpanded)
                  Expanded(
                    child: SingleChildScrollView(
                      child: Text(
                        track.lyrics,
                        style: const TextStyle(height: 1.5, color: Color(0xFFCCD8F6)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQueuePage() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Queue', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text('${_queue.length} songs lined up • drag to reorder', style: const TextStyle(color: Color(0xFFB7C7EB))),
            ],
          ),
        ),
        Expanded(
          child: ReorderableListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
            itemCount: _queue.length,
            onReorder: _reorderQueue,
            itemBuilder: (context, index) {
              final track = _queue[index];
              return Dismissible(
                key: ValueKey('queue-${track.id}'),
                direction: DismissDirection.endToStart,
                background: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: const Color(0xFF4B1730),
                  ),
                  child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
                ),
                confirmDismiss: (_) async => _queue.length > 1,
                onDismissed: (_) => _removeFromQueue(index),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: _trackRow(
                    track: track,
                    index: index,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          onPressed: () => _addToQueueNext(track),
                          icon: const Icon(Icons.playlist_play_rounded, color: Color(0xFFC3D2F5)),
                        ),
                        IconButton(
                          onPressed: () => _removeFromQueue(index),
                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFC3D2F5)),
                        ),
                        ReorderableDragStartListener(
                          index: index,
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: Icon(Icons.drag_indicator_rounded, color: Color(0xFFC3D2F5)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _trackRow({
    required DemoTrack track,
    required int index,
    required Widget trailing,
    String? subtitleSuffix,
  }) {
    final isCurrent = index == _trackIndex && _queue[index].id == _currentTrack.id;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: isCurrent ? const Color(0x3A8AAFFF) : const Color(0x261A2B54),
        border: Border.all(color: isCurrent ? const Color(0x7FAFD0FF) : const Color(0x2FAFC2FF)),
      ),
      child: ListTile(
        onTap: () => _playTrackInQueue(index),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(track.artUrl, width: 54, height: 54, fit: BoxFit.cover),
        ),
        title: Text(track.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(
          subtitleSuffix == null ? track.artist : '${track.artist} • $subtitleSuffix',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: trailing,
      ),
    );
  }

  @override
  void dispose() {
    _discoverSearchController.dispose();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildDiscoverPage(),
      _buildLibraryPage(),
      _buildNowPlayingPage(),
      _buildQueuePage(),
    ];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0A1026), Color(0xFF14264F), Color(0xFF080D1D)],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              if (_loadingSource)
                const Center(child: CircularProgressIndicator())
              else
                IndexedStack(index: _currentTab, children: pages),
              if (!_loadingSource && _currentTab != 2)
                Align(
                  alignment: Alignment.bottomCenter,
                  child: _MiniPlayerDock(
                    track: _currentTrack,
                    playingStream: _player.playingStream,
                    onOpen: () => setState(() => _currentTab = 2),
                    onTogglePlayPause: () => _player.playing ? _player.pause() : _player.play(),
                    onNext: _player.seekToNext,
                  ),
                ),
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xCC0E1733),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0x45AFC2FF)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _navChip(0, Icons.explore_rounded, 'Discover'),
                      _navChip(1, Icons.library_music_rounded, 'Library'),
                      _navChip(2, Icons.play_circle_fill_rounded, 'Player'),
                      _navChip(3, Icons.queue_music_rounded, 'Queue'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _glassIcon(IconData icon, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: const Color(0x33253A74),
          border: Border.all(color: const Color(0x3DAFC2FF)),
        ),
        child: Icon(icon, color: const Color(0xFFE3ECFF)),
      ),
    );
  }

  Widget _navChip(int index, IconData icon, String label) {
    final selected = _currentTab == index;
    return GestureDetector(
      onTap: () {
        setState(() => _currentTab = index);
        _persistUiState();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: selected ? const Color(0xFF8AAFFF) : Colors.transparent,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: selected ? const Color(0xFF1D2A55) : const Color(0xFFC8D6F6)),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: selected ? const Color(0xFF1D2A55) : const Color(0xFFC8D6F6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _repeatIcon(LoopMode mode) {
    if (mode == LoopMode.one) {
      return Icons.repeat_one_rounded;
    }
    if (mode == LoopMode.all) {
      return Icons.repeat_on_rounded;
    }
    return Icons.repeat_rounded;
  }

  String _format(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}

class _PlaylistDetailResult {
  const _PlaylistDetailResult({required this.tracks, required this.startIndex});

  final List<DemoTrack> tracks;
  final int startIndex;
}

class PlaylistDetailScreen extends StatefulWidget {
  const PlaylistDetailScreen({super.key, required this.playlist});

  final DemoPlaylist playlist;

  @override
  State<PlaylistDetailScreen> createState() => _PlaylistDetailScreenState();
}

class _PlaylistDetailScreenState extends State<PlaylistDetailScreen> {
  late List<DemoTrack> _tracks;

  @override
  void initState() {
    super.initState();
    _tracks = List<DemoTrack>.of(widget.playlist.tracks);
  }

  void _reorderTracks(int oldIndex, int newIndex) {
    setState(() {
      if (oldIndex < newIndex) {
        newIndex -= 1;
      }
      final moved = _tracks.removeAt(oldIndex);
      _tracks.insert(newIndex, moved);
    });
  }

  void _playTrack(BuildContext context, int index) {
    Navigator.of(context).pop(
      _PlaylistDetailResult(tracks: _tracks, startIndex: index),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A1026),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded),
                ),
                Text(widget.playlist.name, style: GoogleFonts.sora(fontSize: 24, fontWeight: FontWeight.w700)),
                const SizedBox(width: 48),
              ],
            ),
            const SizedBox(height: 10),
            Text(widget.playlist.description, style: const TextStyle(color: Color(0xFFB7C7EB))),
            const SizedBox(height: 18),
            Row(
              children: [
                FilledButton.icon(
                  onPressed: () => _playTrack(context, 0),
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('Play All'),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () => _playTrack(context, 0),
                  icon: const Icon(Icons.shuffle_rounded),
                  label: const Text('Shuffle Play'),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text('Tracks', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ReorderableListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _tracks.length,
              onReorder: _reorderTracks,
              itemBuilder: (context, index) {
                final track = _tracks[index];
                return Container(
                  key: ValueKey(track.id),
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: const Color(0x261A2B54),
                    border: Border.all(color: const Color(0x2FAFC2FF)),
                  ),
                  child: ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(track.artUrl, width: 54, height: 54, fit: BoxFit.cover),
                    ),
                    title: Text(track.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(track.artist, maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          onPressed: () => _playTrack(context, index),
                          icon: const Icon(Icons.play_arrow_rounded),
                        ),
                        ReorderableDragStartListener(
                          index: index,
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: Icon(Icons.drag_indicator_rounded, color: Color(0xFFC3D2F5)),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0x2A203869),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x35B0C5FF)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 17, color: const Color(0xFFC7D5F5)),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

class _MiniPlayerDock extends StatelessWidget {
  const _MiniPlayerDock({
    required this.track,
    required this.playingStream,
    required this.onOpen,
    required this.onTogglePlayPause,
    required this.onNext,
  });

  final DemoTrack track;
  final Stream<bool> playingStream;
  final VoidCallback onOpen;
  final VoidCallback onTogglePlayPause;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 88),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xE6192A54),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0x40AFC2FF)),
        boxShadow: const [BoxShadow(color: Color(0x5024386B), blurRadius: 20, spreadRadius: 2)],
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: onOpen,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(track.artUrl, width: 50, height: 50, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: GestureDetector(
              onTap: onOpen,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(track.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(track.artist, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12)),
                ],
              ),
            ),
          ),
          IconButton(onPressed: onNext, icon: const Icon(Icons.skip_next_rounded, color: Color(0xFFDCE8FF))),
          StreamBuilder<bool>(
            stream: playingStream,
            builder: (context, snapshot) {
              final playing = snapshot.data ?? false;
              return IconButton(
                onPressed: onTogglePlayPause,
                icon: Icon(
                  playing ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
                  color: const Color(0xFFEAF1FF),
                  size: 33,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
