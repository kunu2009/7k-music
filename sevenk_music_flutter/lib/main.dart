import 'dart:convert';
import 'dart:async';

import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:on_audio_query/on_audio_query.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Note: JustAudioBackground disabled as it causes single-instance conflicts
  // when using just_audio in foreground-only playback. Re-enable if background
  // playback service is needed later.
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
    this.youtubeVideoId,
  });

  final String id;
  final String title;
  final String artist;
  final String audioUrl;
  final String artUrl;
  final String lyrics;
  final String? youtubeVideoId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'artist': artist,
        'audioUrl': audioUrl,
        'artUrl': artUrl,
        'lyrics': lyrics,
        'youtubeVideoId': youtubeVideoId,
      };

  factory DemoTrack.fromJson(Map<String, dynamic> json) {
    return DemoTrack(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Unknown Track',
      artist: json['artist']?.toString() ?? 'Unknown Artist',
      audioUrl: json['audioUrl']?.toString() ?? '',
      artUrl: json['artUrl']?.toString() ?? _fallbackArtUrl,
      lyrics: json['lyrics']?.toString() ?? '',
      youtubeVideoId: json['youtubeVideoId']?.toString(),
    );
  }
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

const String _fallbackArtUrl =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';

const DemoTrack _emptyTrack = DemoTrack(
  id: 'empty',
  title: 'No track selected',
  artist: '7K Music',
  audioUrl: '',
  artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
  lyrics: 'Search YouTube or open local files to start playing.',
);

final demoPlaylists = <DemoPlaylist>[];

final ValueNotifier<int> themePresetNotifier = ValueNotifier<int>(0);

ThemeData buildAppTheme(int preset) {
  switch (preset) {
    case 1:
      return ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF071A16),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF76E7C4),
          secondary: Color(0xFF9DFFD7),
          surface: Color(0xFF102B25),
        ),
      );
    case 2:
      return ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF201109),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFFB36B),
          secondary: Color(0xFFFFD2A1),
          surface: Color(0xFF2D1A10),
        ),
      );
    default:
      return ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050814),
        textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF8AAFFF),
          secondary: Color(0xFFA9BFFF),
          surface: Color(0xFF111A33),
        ),
      );
  }
}

class RoyaltyFreeService {
  final String name;
  final String description;
  final String category;
  final String url;
  final String icon;

  const RoyaltyFreeService({
    required this.name,
    required this.description,
    required this.category,
    required this.url,
    required this.icon,
  });
}

final royaltyFreeServices = <RoyaltyFreeService>[
  RoyaltyFreeService(
    name: 'Free Music Archive',
    description: 'Curated royalty-free music from independent artists',
    category: 'Music',
    url: 'https://freemusicarchive.org',
    icon: '🎵',
  ),
  RoyaltyFreeService(
    name: 'Incompetech',
    description: 'High-quality background music for creators',
    category: 'Music',
    url: 'https://incompetech.com',
    icon: '🎼',
  ),
  RoyaltyFreeService(
    name: 'Pixabay Music',
    description: 'Free music library with 1000+ tracks',
    category: 'Music',
    url: 'https://pixabay.com/music',
    icon: '🎶',
  ),
  RoyaltyFreeService(
    name: 'YouTube Audio Library',
    description: 'Free music and sound effects from YouTube',
    category: 'Music',
    url: 'https://www.youtube.com/audiolibrary',
    icon: '🎵',
  ),
  RoyaltyFreeService(
    name: 'Epidemic Sound',
    description: 'Royalty-free music for content creators',
    category: 'Music',
    url: 'https://www.epidemicsound.com',
    icon: '🎧',
  ),
  RoyaltyFreeService(
    name: 'Bensound',
    description: 'Free, downloadable background music',
    category: 'Music',
    url: 'https://www.bensound.com',
    icon: '🎹',
  ),
  RoyaltyFreeService(
    name: 'ccMixter',
    description: 'Licensed creative commons music',
    category: 'Music',
    url: 'https://ccmixter.org',
    icon: '🎤',
  ),
  RoyaltyFreeService(
    name: 'Jamendo',
    description: 'Millions of free music tracks and albums',
    category: 'Music',
    url: 'https://www.jamendo.com',
    icon: '🎸',
  ),
];

class SevenKMusicApp extends StatelessWidget {
  const SevenKMusicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: themePresetNotifier,
      builder: (context, preset, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: '7K Music Player',
          theme: buildAppTheme(preset),
          home: const SevenKMusicShell(),
        );
      },
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
  final OnAudioQuery _audioQuery = OnAudioQuery();
  final TextEditingController _discoverSearchController = TextEditingController();
  late final PageController _pageController;
  late final WebViewController _youtubeController;

  static const String _prefsCurrentTabKey = 'sevenk.currentTab.v1';
  static const String _prefsActivePlaylistKey = 'sevenk.activePlaylist.v1';
  static const String _prefsQueueOrderKey = 'sevenk.queueOrder.v1';
  static const String _prefsRecentSearchesKey = 'sevenk.recentSearches.v1';
  static const String _prefsDownloadedTracksKey = 'sevenk.downloadedTrackIds.v1';
  static const String _prefsDownloadedTrackDataKey = 'sevenk.downloadedTrackData.v1';
  static const String _prefsPlaylistsKey = 'sevenk.playlists.v1';
  static const String _prefsLibraryTabKey = 'sevenk.libraryTab.v1';
  static const String _prefsThemePresetKey = 'sevenk.themePreset.v1';
  static const String _prefsLikedTracksKey = 'sevenk.likedTracks.v1';
  static const bool _youtubeExternalPlaybackOnly = false;

  int _currentTab = 0;
  int _libraryTabIndex = 0; // 0 = Playlists, 1 = Downloads, 2 = Royalty-Free
  int _themePreset = 0;
  int _trackIndex = 0;
  List<DemoTrack> _queue = <DemoTrack>[];
  String? _activePlaylistId;
  String _discoverQuery = '';
  String? _discoverSearchError;
  String? _deviceAudioError;
  final List<String> _recentDiscoverSearches = <String>[];
  final List<DemoTrack> _discoverRemoteTracks = <DemoTrack>[];
  final List<SongModel> _deviceSongs = <SongModel>[];
  final Set<String> _downloadedTrackIds = <String>{};
  final Map<String, DemoTrack> _downloadedTrackCache = <String, DemoTrack>{};
  String? _activeYouTubeVideoId;
  final Set<String> _likedTrackIds = <String>{};
  final Map<String, DemoTrack> _likedTrackCache = <String, DemoTrack>{};
  final Map<String, List<DemoTrack>> _playlistTracks = {
    for (final playlist in demoPlaylists) playlist.id: List<DemoTrack>.of(playlist.tracks),
  };

  LoopMode _loopMode = LoopMode.off;
  bool _shuffleEnabled = false;
  bool _loadingSource = true;
  bool _discoverSearching = false;
  bool _discoverShelfLoading = false;
  bool _deviceAudioLoading = false;
  bool _lyricsExpanded = true;
  bool _audioReady = false;
  String? _startupError;
  String? _localPlaybackDebug;
  SharedPreferences? _prefs;
  final Map<String, List<DemoTrack>> _discoverShelves = <String, List<DemoTrack>>{};
  

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentTab);
    _youtubeController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onWebResourceError: (error) {
            debugPrint('YouTube webview error: ${error.description}');
          },
        ),
      )
      ..setBackgroundColor(const Color(0xFF000000));
    _player = AudioPlayer();
    _init();
  }

  Future<void> _init() async {
    try {
      final session = await AudioSession.instance;
      await session.configure(const AudioSessionConfiguration.music());

      _prefs = await SharedPreferences.getInstance();
      await _restoreUiState();
      themePresetNotifier.value = _themePreset;
      if (_pageController.hasClients) {
        _pageController.jumpToPage(_currentTab);
      }

      await _loadQueue(initialIndex: 0, autoPlay: false);
      unawaited(_loadDeviceAudio());
      unawaited(_loadDiscoverShelves());
    } catch (error) {
      debugPrint('Startup init failed: $error');
      if (mounted) {
        setState(() {
          _startupError = 'Audio unavailable. Tap Retry to reconnect.';
          _loadingSource = false;
        });
      }
    }

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
    if (_queue.isEmpty) {
      if (mounted) {
        setState(() {
          _audioReady = false;
          _loadingSource = false;
          _startupError = null;
        });
      }
      return;
    }

    final safeIndex = initialIndex.clamp(0, _queue.length - 1);
    final targetTrack = _queue[safeIndex];

    if (_isYoutubeTrack(targetTrack)) {
      setState(() {
        _trackIndex = safeIndex;
        _loadingSource = false;
        _audioReady = false;
      });
      await _loadYoutubeTrack(targetTrack, autoplay: autoPlay);
      return;
    }

    final candidateSources = <String>[];
    if (targetTrack.audioUrl.trim().isNotEmpty) {
      candidateSources.add(targetTrack.audioUrl.trim());
    }

    if (targetTrack.id.startsWith('local-')) {
      for (final song in _deviceSongs) {
        if ('local-${song.id}' == targetTrack.id) {
          for (final uri in _localAudioUris(song)) {
            final next = uri.toString();
            if (!candidateSources.contains(next)) {
              candidateSources.add(next);
            }
          }
          break;
        }
      }
    }

    setState(() {
      _loadingSource = true;
      _startupError = null;
    });

    try {
      if (candidateSources.isEmpty) {
        throw const FormatException('Invalid audio source');
      }

      Object? lastError;
      final tag = MediaItem(
        id: targetTrack.id,
        title: targetTrack.title,
        artist: targetTrack.artist,
        artUri: Uri.parse(targetTrack.artUrl),
      );

      for (final candidate in candidateSources) {

        try {
          await _setPlayerSourceFromCandidate(
            candidate: candidate,
            tag: tag,
            timeout: const Duration(seconds: 30),
          );
          if (autoPlay) {
            await _player.play();
          }
          lastError = null;
          _audioReady = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (lastError != null) {
        throw lastError;
      }
    } catch (error) {
      debugPrint('Queue load failed: $error');
      if (mounted) {
        setState(() {
          _audioReady = false;
          _startupError = 'Could not load audio. Check network and tap Retry.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _activeYouTubeVideoId = null;
          _trackIndex = safeIndex;
          _loadingSource = false;
          if (autoPlay && !targetTrack.id.startsWith('yt-')) {
            _currentTab = 2;
          }
        });
        if (autoPlay && !targetTrack.id.startsWith('yt-')) {
          _pageController.jumpToPage(2);
        }
      }
    }
  }

  Future<void> _ensureQueueReadyAndPlay() async {
    if (_queue.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(const SnackBar(content: Text('Search for a song or open a local file first.')));
      return;
    }

    if (_isYoutubeTrack(_currentTrack)) {
      if (_activeYouTubeVideoId == null) {
        await _loadYoutubeTrack(_currentTrack);
      }
      return;
    }

    if (_audioReady) {
      if (_player.playing) {
        await _player.pause();
      } else {
        await _player.play();
      }
      return;
    }

    await _loadQueue(initialIndex: _trackIndex, autoPlay: true);
  }

  Future<void> _nextTrackSafe() async {
    if (_queue.isEmpty) return;
    final nextIndex = (_trackIndex + 1).clamp(0, _queue.length - 1);
    await _playTrackInQueue(nextIndex);
  }

  Future<void> _previousTrackSafe() async {
    if (_queue.isEmpty) return;
    final previousIndex = (_trackIndex - 1).clamp(0, _queue.length - 1);
    await _playTrackInQueue(previousIndex);
  }

  DemoTrack _demoTrackFromLocalSong(SongModel song) {
    return DemoTrack(
      id: 'local-${song.id}',
      title: song.title,
      artist: song.artist ?? 'Unknown Artist',
      audioUrl: _safeSongUri(song).isNotEmpty ? _safeSongUri(song) : _safeSongData(song),
      artUrl: _fallbackArtUrl,
      lyrics: 'Local file from your device storage.',
    );
  }

  bool _isLikelyMusicSong(SongModel song) {
    final data = _safeSongData(song).toLowerCase();
    const blocked = [
      '/alarms/',
      '/notifications/',
      '/ringtones/',
    ];

    if (_safeSongDuration(song) < 1000) {
      return false;
    }

    for (final term in blocked) {
      if (data.contains(term)) return false;
    }

    return true;
  }

  String _safeSongData(SongModel song) {
    try {
      return song.data;
    } catch (_) {
      return '';
    }
  }

  String _safeSongUri(SongModel song) {
    try {
      final uri = song.uri;
      if (uri != null && uri.isNotEmpty) return uri;
    } catch (_) {
      // Fallback to data path below.
    }
    return _safeSongData(song);
  }

  bool _looksLikeFilePath(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return false;
    return trimmed.startsWith('/') || RegExp(r'^[A-Za-z]:\\').hasMatch(trimmed);
  }

  String? _asFilePath(String value) {
    final trimmed = value.trim();
    if (trimmed.startsWith('file://')) {
      try {
        return Uri.parse(trimmed).toFilePath();
      } catch (_) {
        return null;
      }
    }
    if (_looksLikeFilePath(trimmed)) {
      return trimmed;
    }
    return null;
  }

  Future<void> _setPlayerSourceFromCandidate({
    required String candidate,
    required MediaItem tag,
    required Duration timeout,
  }) async {
    final trimmed = candidate.trim();
    if (trimmed.isEmpty) {
      throw const FormatException('Empty audio source');
    }

    final filePath = _asFilePath(trimmed);
    if (filePath != null) {
      await _player.setFilePath(filePath, tag: tag).timeout(timeout);
      return;
    }

    final uri = _resolvePlayableUri(trimmed);
    await _player.setAudioSource(AudioSource.uri(uri, tag: tag)).timeout(timeout);
  }

  Uri _resolvePlayableUri(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      throw const FormatException('Empty audio source');
    }

    if (trimmed.startsWith('content://') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('file://')) {
      return Uri.parse(trimmed);
    }

    if (trimmed.startsWith('/') || RegExp(r'^[A-Za-z]:\\').hasMatch(trimmed)) {
      return Uri.file(trimmed);
    }

    return Uri.parse(trimmed);
  }

  List<Uri> _localAudioUris(SongModel song) {
    final candidates = <String>[
      _safeSongUri(song),
      _safeSongData(song),
    ];

    final uris = <Uri>[];
    for (final candidate in candidates) {
      if (candidate.trim().isEmpty) continue;
      try {
        final resolved = _resolvePlayableUri(candidate);
        if (!uris.contains(resolved)) {
          uris.add(resolved);
        }
      } catch (_) {
        // Skip malformed candidates and try the next source.
      }
    }
    return uris;
  }

  String _extractYouTubeVideoId(String value) {
    final trimmed = value.trim();
    if (trimmed.length == 11 && !trimmed.contains(' ')) {
      return trimmed;
    }

    final patterns = <RegExp>[
      RegExp(r'v=([A-Za-z0-9_-]{11})'),
      RegExp(r'youtu\.be/([A-Za-z0-9_-]{11})'),
      RegExp(r'/shorts/([A-Za-z0-9_-]{11})'),
      RegExp(r'/embed/([A-Za-z0-9_-]{11})'),
      RegExp(r'([A-Za-z0-9_-]{11})'),
    ];

    for (final pattern in patterns) {
      final match = pattern.firstMatch(trimmed);
      if (match != null) {
        return match.group(1) ?? '';
      }
    }

    return '';
  }

  int _safeSongDuration(SongModel song) {
    try {
      return song.duration ?? 0;
    } catch (_) {
      return 0;
    }
  }

  bool _isYoutubeTrack(DemoTrack track) {
    return track.youtubeVideoId != null && track.youtubeVideoId!.isNotEmpty;
  }

  Uri _youtubeEmbedUri(String videoId, {required bool autoplay}) {
    return Uri.parse(
      'https://www.youtube-nocookie.com/embed/$videoId?autoplay=${autoplay ? 1 : 0}&playsinline=1&controls=1&rel=0&modestbranding=1&iv_load_policy=3',
    );
  }

  String _youtubeEmbedHtml(String videoId, {required bool autoplay}) {
    final embedUrl = _youtubeEmbedUri(videoId, autoplay: autoplay).toString();
    return '''
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #000;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      iframe {
        border: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <iframe
      src="$embedUrl"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </body>
</html>
''';
  }

  Uri _youtubeWatchUri(String videoId) {
    return Uri.parse('https://www.youtube.com/watch?v=$videoId');
  }

  Future<void> _openYoutubeExternal(String videoId) async {
    final watchUri = _youtubeWatchUri(videoId);
    final launched = await launchUrl(watchUri, mode: LaunchMode.externalApplication);
    if (launched) return;

    await launchUrl(watchUri, mode: LaunchMode.platformDefault);
  }

  Future<void> _loadYoutubeTrack(DemoTrack track, {bool autoplay = true}) async {
    final videoId = track.youtubeVideoId;
    if (videoId == null || videoId.isEmpty) return;

    if (mounted) {
      setState(() {
        _startupError = null;
        _loadingSource = false;
        _audioReady = false;
        _activeYouTubeVideoId = videoId;
        _currentTab = 2;
      });
    }

    if (_youtubeExternalPlaybackOnly) {
      try {
        await _openYoutubeExternal(videoId);
      } catch (error) {
        debugPrint('YouTube external launch failed: $error');
        if (mounted) {
          setState(() {
            _startupError = 'Could not open YouTube. Please try again.';
          });
        }
      }
    } else {
      try {
        await _youtubeController.loadHtmlString(
          _youtubeEmbedHtml(videoId, autoplay: autoplay),
          baseUrl: 'https://www.youtube-nocookie.com',
        );
      } catch (error) {
        debugPrint('YouTube embed load failed: $error');
        if (mounted) {
          setState(() {
            _startupError = 'Embedded playback failed. Tap Watch on YouTube below.';
          });
        }
      }
    }
    _pageController.jumpToPage(2);
    await _persistUiState();
  }

  Future<void> _loadDeviceAudio() async {
    if (mounted) {
      setState(() {
        _deviceAudioLoading = true;
        _deviceAudioError = null;
      });
    }

    try {
      var hasPermission = await _audioQuery.permissionsStatus();
      if (!hasPermission) {
        hasPermission = await _audioQuery.permissionsRequest();
      }

      if (!hasPermission) {
        throw Exception('Audio permission denied');
      }

      final songs = await _audioQuery.querySongs(
        uriType: UriType.EXTERNAL,
        orderType: OrderType.ASC_OR_SMALLER,
        ignoreCase: true,
      );

      final seenUris = <String>{};
      final uniqueSongs = <SongModel>[];
      for (final song in songs) {
        final uri = _safeSongUri(song);
        if (uri.isEmpty) continue;
        if (seenUris.contains(uri)) continue;
        seenUris.add(uri);
        uniqueSongs.add(song);
      }

      if (!mounted) return;
      setState(() {
        _deviceSongs
          ..clear()
          ..addAll(uniqueSongs.where(_isLikelyMusicSong));
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _deviceAudioError = 'Could not read local audio. Allow media permission and tap Refresh.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _deviceAudioLoading = false;
        });
      }
    }
  }

  Future<void> _playLocalSong(SongModel song) async {
    final sourceCandidates = <String>[];
    for (final uri in _localAudioUris(song)) {
      final next = uri.toString();
      if (!sourceCandidates.contains(next)) {
        sourceCandidates.add(next);
      }
    }

    if (sourceCandidates.isEmpty) {
      if (!mounted) return;
      setState(() {
        _startupError = 'Selected local file is unavailable.';
      });
      return;
    }

    final localTrack = _demoTrackFromLocalSong(song);
    Object? lastError;

    try {
      if (mounted) {
        setState(() {
          _loadingSource = true;
          _startupError = null;
          _localPlaybackDebug = null;
        });
      }

      final tag = MediaItem(
        id: localTrack.id,
        title: localTrack.title,
        artist: localTrack.artist,
        artUri: Uri.parse(_fallbackArtUrl),
      );

      for (final candidate in sourceCandidates) {

        try {
          await _player.stop();
          await _setPlayerSourceFromCandidate(
            candidate: candidate,
            tag: tag,
            timeout: const Duration(seconds: 20),
          );
          await _player.play();
          lastError = null;
          break;
        } catch (error) {
          lastError = 'candidate=$candidate error=$error';
        }
      }

      if (lastError != null) {
        throw lastError;
      }

      if (!mounted) return;
      setState(() {
        _queue = [localTrack];
        _trackIndex = 0;
        _audioReady = true;
        _activeYouTubeVideoId = null;
        _loadingSource = false;
        _currentTab = 2;
      });
      _pageController.jumpToPage(2);
      await _persistUiState();
    } catch (error) {
      debugPrint('Local playback failed: $error');
      if (!mounted) return;
      setState(() {
        _startupError = 'Could not play local audio file. Try another file or refresh the library.';
        _localPlaybackDebug = error.toString();
        _loadingSource = false;
      });
    }
  }

  Future<List<DemoTrack>> _fetchOnlineTracks(String query) async {
    final normalized = query.trim();
    if (normalized.isEmpty) {
      return const <DemoTrack>[];
    }

    final candidates = <Uri>[
      Uri.https('music.7kc.me', '/api/search', {'q': normalized, 'maxResults': '25'}),
      Uri.https('7k-music-7f6u.vercel.app', '/api/search', {'q': normalized, 'maxResults': '25'}),
      Uri.https('piped.video', '/api/v1/search', {'q': normalized, 'filter': 'videos'}),
      Uri.https('pipedapi.kavin.rocks', '/api/v1/search', {'q': normalized, 'filter': 'videos'}),
    ];

    http.Response? response;
    Object? lastError;
    for (final uri in candidates) {
      try {
        final next = await http.get(uri).timeout(const Duration(seconds: 15));
        if (next.statusCode == 200) {
          response = next;
          break;
        }
        lastError = Exception('Search API failed: ${next.statusCode}');
      } catch (error) {
        lastError = error;
      }
    }

    if (response == null) {
      throw lastError ?? Exception('Search API failed');
    }

    final decoded = jsonDecode(response.body);
    final results = decoded is Map<String, dynamic> && decoded['results'] is List
        ? decoded['results'] as List
        : const <dynamic>[];

    final parsed = <DemoTrack>[];
    for (final item in results) {
      if (item is! Map<String, dynamic>) continue;

      final rawId = item['id']?.toString() ?? item['videoId']?.toString() ?? item['url']?.toString() ?? item['link']?.toString() ?? '';
      final videoId = _extractYouTubeVideoId(rawId);
      final title = item['title']?.toString();
      final artist = item['artist']?.toString() ?? item['uploaderName']?.toString() ?? item['author']?.toString();
      final thumbnail = item['thumbnail']?.toString() ?? item['thumbnailUrl']?.toString() ?? item['thumbnailUri']?.toString();

      if (videoId.isEmpty || title == null || title.trim().isEmpty) continue;

      parsed.add(
        DemoTrack(
          id: 'yt-$videoId',
          title: title,
          artist: artist ?? 'Unknown Artist',
          audioUrl: 'https://www.youtube.com/watch?v=$videoId',
          artUrl: thumbnail ?? _fallbackArtUrl,
          lyrics: 'YouTube music video. Click to play on YouTube.',
          youtubeVideoId: videoId,
        ),
      );
    }

    return parsed;
  }

  Future<void> _searchOnlineTracks(String query) async {
    final normalized = query.trim();
    if (normalized.isEmpty) {
      if (!mounted) return;
      setState(() {
        _discoverRemoteTracks.clear();
        _discoverSearchError = null;
        _discoverSearching = false;
      });
      return;
    }

    if (mounted) {
      setState(() {
        _discoverSearching = true;
        _discoverSearchError = null;
      });
    }

    try {
      final parsed = await _fetchOnlineTracks(normalized);

      if (!mounted) return;
      setState(() {
        _discoverRemoteTracks
          ..clear()
          ..addAll(parsed);
        _discoverSearchError = parsed.isEmpty ? 'No search results found.' : null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _discoverSearchError = 'Search failed. Check network and try again.';
      });
      debugPrint('Search error: $e');
    } finally {
      if (mounted) {
        setState(() {
          _discoverSearching = false;
        });
      }
    }
  }

  Future<void> _playOrQueueTrack(DemoTrack track, {int? queueIndex}) async {
    if (_isYoutubeTrack(track)) {
      final existingIndex = _queue.indexWhere((item) => item.id == track.id);
      if (existingIndex >= 0) {
        _trackIndex = existingIndex;
      } else {
        _queue = [..._queue, track];
        _trackIndex = _queue.length - 1;
      }
      await _persistUiState();
      await _loadYoutubeTrack(track);
      return;
    }

    if (queueIndex != null) {
      await _playTrackInQueue(queueIndex);
      return;
    }

    final existingIndex = _queue.indexWhere((item) => item.id == track.id);
    if (existingIndex >= 0) {
      await _playTrackInQueue(existingIndex);
      return;
    }

    _queue = [..._queue, track];
    await _persistUiState();
    await _loadQueue(initialIndex: _queue.length - 1, autoPlay: true);
  }

  DemoTrack get _currentTrack => _queue.isEmpty ? _emptyTrack : _queue[_trackIndex.clamp(0, _queue.length - 1)];

  DemoTrack? _trackFromId(String id) {
    for (final track in [
      ..._queue,
      ..._discoverRemoteTracks,
      ..._likedTrackCache.values,
      ..._downloadedTrackCache.values,
    ]) {
      if (track.id == id) return track;
    }
    return null;
  }

  DemoPlaylist? _playlistFromJson(Map<String, dynamic> data) {
    final id = data['id'];
    final name = data['name'];
    final description = data['description'];
    final trackIdsDynamic = data['trackIds'];

    if (id is! String || name is! String || description is! String || trackIdsDynamic is! List) {
      return null;
    }

    final trackIds = trackIdsDynamic.whereType<String>();
    final tracks = trackIds.map(_trackFromId).whereType<DemoTrack>().toList();
    if (tracks.isEmpty) {
      return null;
    }

    return DemoPlaylist(
      id: id,
      name: name,
      description: description,
      tracks: tracks,
    );
  }

  Future<void> _persistPlaylists() async {
    final prefs = _prefs;
    if (prefs == null) return;

    final payload = demoPlaylists
        .map((playlist) {
          final tracks = _playlistTracks[playlist.id] ?? playlist.tracks;
          return {
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'trackIds': tracks.map((track) => track.id).toList(),
          };
        })
        .toList();

    await prefs.setString(_prefsPlaylistsKey, jsonEncode(payload));
  }

  Future<void> _restoreUiState() async {
    final prefs = _prefs;
    if (prefs == null) return;

    final rawPlaylists = prefs.getString(_prefsPlaylistsKey);
    if (rawPlaylists != null && rawPlaylists.isNotEmpty) {
      try {
        final decoded = jsonDecode(rawPlaylists);
        if (decoded is List) {
          final restored = decoded
              .whereType<Map>()
              .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
              .map(_playlistFromJson)
              .whereType<DemoPlaylist>()
              .toList();

          if (restored.isNotEmpty) {
            demoPlaylists
              ..clear()
              ..addAll(restored);

            _playlistTracks
              ..clear()
              ..addEntries(
                restored.map((playlist) => MapEntry(playlist.id, List<DemoTrack>.of(playlist.tracks))),
              );
          }
        }
      } catch (_) {
        // Ignore malformed playlist cache and continue with defaults.
      }
    }

    setState(() {
      final savedTab = prefs.getInt(_prefsCurrentTabKey) ?? 0;
      _currentTab = savedTab.clamp(0, 4);

      final savedLibraryTab = prefs.getInt(_prefsLibraryTabKey) ?? 0;
      _libraryTabIndex = savedLibraryTab.clamp(0, 2);

      final recentSearches = prefs.getStringList(_prefsRecentSearchesKey) ?? const <String>[];
      _recentDiscoverSearches
        ..clear()
        ..addAll(recentSearches);

      final downloadedIds = prefs.getStringList(_prefsDownloadedTracksKey) ?? const <String>[];
      _downloadedTrackIds
        ..clear()
        ..addAll(downloadedIds);

      final rawDownloadedTracks = prefs.getString(_prefsDownloadedTrackDataKey);
      if (rawDownloadedTracks != null && rawDownloadedTracks.isNotEmpty) {
        try {
          final decodedDownloaded = jsonDecode(rawDownloadedTracks);
          if (decodedDownloaded is List) {
            _downloadedTrackCache.clear();
            for (final entry in decodedDownloaded.whereType<Map>()) {
              final track = DemoTrack.fromJson(entry.map((key, value) => MapEntry(key.toString(), value)));
              if (track.id.isNotEmpty) {
                _downloadedTrackCache[track.id] = track;
              }
            }
          }
        } catch (_) {
          // Ignore malformed offline cache.
        }
      }

      final savedThemePreset = int.tryParse(prefs.getString(_prefsThemePresetKey) ?? '0') ?? 0;
      _themePreset = savedThemePreset.clamp(0, 2);

      final rawLiked = prefs.getString(_prefsLikedTracksKey);
      if (rawLiked != null && rawLiked.isNotEmpty) {
        try {
          final decodedLiked = jsonDecode(rawLiked);
          if (decodedLiked is List) {
            _likedTrackIds.clear();
            _likedTrackCache.clear();
            for (final entry in decodedLiked.whereType<Map>()) {
              final track = DemoTrack.fromJson(entry.map((key, value) => MapEntry(key.toString(), value)));
              if (track.id.isNotEmpty) {
                _likedTrackIds.add(track.id);
                _likedTrackCache[track.id] = track;
              }
            }
          }
        } catch (_) {
          // Ignore malformed liked-track cache.
        }
      }

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

      _activeYouTubeVideoId = prefs.getString('sevenk.activeYouTubeVideoId.v1');

      themePresetNotifier.value = _themePreset;
    });
  }

  Future<void> _persistUiState() async {
    final prefs = _prefs;
    if (prefs == null) return;

    await prefs.setInt(_prefsCurrentTabKey, _currentTab);
    await prefs.setInt(_prefsLibraryTabKey, _libraryTabIndex);
    if (_activePlaylistId == null) {
      await prefs.remove(_prefsActivePlaylistKey);
    } else {
      await prefs.setString(_prefsActivePlaylistKey, _activePlaylistId!);
    }
    await prefs.setStringList(_prefsQueueOrderKey, _queue.map((track) => track.id).toList());
    await prefs.setStringList(_prefsRecentSearchesKey, _recentDiscoverSearches);
    await prefs.setStringList(_prefsDownloadedTracksKey, _downloadedTrackIds.toList());
    await prefs.setString(
      _prefsDownloadedTrackDataKey,
      jsonEncode(
        _downloadedTrackIds
            .map((id) => _downloadedTrackCache[id]?.toJson())
            .whereType<Map<String, dynamic>>()
            .toList(),
      ),
    );
    await prefs.setString(_prefsThemePresetKey, _themePreset.toString());
    if (_activeYouTubeVideoId == null) {
      await prefs.remove('sevenk.activeYouTubeVideoId.v1');
    } else {
      await prefs.setString('sevenk.activeYouTubeVideoId.v1', _activeYouTubeVideoId!);
    }
    await prefs.setString(
      _prefsLikedTracksKey,
      jsonEncode(
        _likedTrackIds.map((id) => _likedTrackCache[id]?.toJson()).whereType<Map<String, dynamic>>().toList(),
      ),
    );
    await _persistPlaylists();
  }

  List<DemoTrack> get _likedTracks =>
      _likedTrackIds.map((id) => _likedTrackCache[id]).whereType<DemoTrack>().toList();

  Future<void> _toggleLikedTrack(DemoTrack track) async {
    setState(() {
      if (_likedTrackIds.contains(track.id)) {
        _likedTrackIds.remove(track.id);
        _likedTrackCache.remove(track.id);
      } else {
        _likedTrackIds.add(track.id);
        _likedTrackCache[track.id] = track;
      }
    });
    await _persistUiState();
  }

  Future<void> _setThemePreset(int preset) async {
    setState(() {
      _themePreset = preset.clamp(0, 2);
    });
    themePresetNotifier.value = _themePreset;
    await _persistUiState();
  }

  Future<void> _openExpandedPlayer() async {
    if (!mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FractionallySizedBox(
          heightFactor: 0.94,
          child: Container(
            decoration: const BoxDecoration(
              color: Color(0xFF0A1026),
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 54,
                  height: 5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFB7C7EB).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Expanded Player', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w700)),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0x2FAFC2FF)),
                Expanded(child: _buildNowPlayingPage()),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _renamePlaylist(DemoPlaylist playlist) async {
    final controller = TextEditingController(text: playlist.name);
    final nextName = await showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Rename playlist'),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: const InputDecoration(hintText: 'Playlist name'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(controller.text.trim()),
              child: const Text('Save'),
            ),
          ],
        );
      },
    );

    if (!mounted) return;
    final name = nextName?.trim();
    if (name == null || name.isEmpty || name == playlist.name) {
      return;
    }

    final index = demoPlaylists.indexWhere((item) => item.id == playlist.id);
    if (index < 0) return;

    setState(() {
      final tracks = _playlistTracks[playlist.id] ?? playlist.tracks;
      demoPlaylists[index] = DemoPlaylist(
        id: playlist.id,
        name: name,
        description: playlist.description,
        tracks: tracks,
      );
    });

    await _persistUiState();
  }

  Future<void> _deletePlaylist(DemoPlaylist playlist) async {
    if (demoPlaylists.length <= 1) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(const SnackBar(content: Text('At least one playlist is required.')));
      return;
    }

    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete playlist?'),
        content: Text('Remove "${playlist.name}" from your library?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (!mounted || shouldDelete != true) {
      return;
    }

    setState(() {
      demoPlaylists.removeWhere((item) => item.id == playlist.id);
      _playlistTracks.remove(playlist.id);
      if (_activePlaylistId == playlist.id) {
        _activePlaylistId = demoPlaylists.first.id;
      }
    });

    await _persistUiState();
  }

  Future<void> _reorderLibraryPlaylists(int oldIndex, int newIndex) async {
    if (oldIndex < newIndex) {
      newIndex -= 1;
    }
    if (oldIndex == newIndex) return;

    setState(() {
      final moved = demoPlaylists.removeAt(oldIndex);
      demoPlaylists.insert(newIndex, moved);
    });

    await _persistUiState();
  }

  List<DemoTrack> _tracksForPlaylist(DemoPlaylist playlist) {
    return _playlistTracks[playlist.id] ?? playlist.tracks;
  }

  List<DemoTrack> get _downloadedTracks {
    return _downloadedTrackIds.map((id) => _downloadedTrackCache[id]).whereType<DemoTrack>().toList();
  }

  Future<void> _playTrackInQueue(int index) async {
    if (index < 0 || index >= _queue.length) return;
    final selected = _queue[index];
    if (_isYoutubeTrack(selected)) {
      _trackIndex = index;
      await _persistUiState();
      await _loadYoutubeTrack(selected);
      return;
    }

    if (!_audioReady) {
      await _loadQueue(initialIndex: index, autoPlay: true);
      return;
    }
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
    await _playTrackInQueue(initialIndex < 0 ? 0 : initialIndex);
  }

  Future<void> _openPlaylistDetail(DemoPlaylist playlist) async {
    final result = await Navigator.of(context).push<_PlaylistDetailResult>(
      MaterialPageRoute(
        builder: (_) => PlaylistDetailScreen(
          playlist: DemoPlaylist(
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            tracks: List<DemoTrack>.of(_tracksForPlaylist(playlist)),
          ),
        ),
      ),
    );

    if (!mounted || result == null) {
      return;
    }

    _activePlaylistId = playlist.id;
    _playlistTracks[playlist.id] = List<DemoTrack>.of(result.tracks);
    _queue = List<DemoTrack>.of(result.tracks);
    await _persistUiState();
    await _playTrackInQueue(result.startIndex);
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

  Future<void> _loadDiscoverShelves() async {
    if (_discoverShelfLoading || _discoverShelves.isNotEmpty) {
      return;
    }

    if (mounted) {
      setState(() {
        _discoverShelfLoading = true;
      });
    }

    final configs = <Map<String, String>>[
      {'title': 'Trending Now', 'query': 'trending songs'},
      {'title': 'Latest Uploads', 'query': 'latest songs'},
      {'title': 'Top Hits', 'query': 'top songs'},
    ];

    final shelves = <String, List<DemoTrack>>{};
    for (final config in configs) {
      try {
        final tracks = await _fetchOnlineTracks(config['query']!);
        if (tracks.isNotEmpty) {
          shelves[config['title']!] = tracks.take(6).toList();
        }
      } catch (error) {
        debugPrint('Discover shelf load failed for ${config['title']}: $error');
      }
    }

    if (!mounted) return;
    setState(() {
      _discoverShelves
        ..clear()
        ..addAll(shelves);
      _discoverShelfLoading = false;
    });
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
    unawaited(_searchOnlineTracks(normalized));
  }

  List<String> _discoverSuggestions(String query) {
    final normalized = query.trim().toLowerCase();
    final source = <String>[
      ..._recentDiscoverSearches,
      'lofi hip hop',
      'chill beats',
      'focus music',
      'study mix',
      'rain sounds',
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

  Future<void> _restoreQueue(List<DemoTrack> restoredQueue, String currentTrackId) async {
    if (restoredQueue.isEmpty) return;

    _queue = List<DemoTrack>.of(restoredQueue);
    final restoredIndex = _queue.indexWhere((track) => track.id == currentTrackId);
    await _persistUiState();
    await _loadQueue(
      initialIndex: restoredIndex < 0 ? 0 : restoredIndex,
      autoPlay: _player.playing,
    );
  }

  Future<void> _clearQueueWithUndo() async {
    if (_queue.length <= 1) {
      return;
    }

    final previousQueue = List<DemoTrack>.of(_queue);
    final previousCurrentTrackId = _currentTrack.id;

    _queue = <DemoTrack>[_currentTrack];
    await _persistUiState();
    await _loadQueue(initialIndex: 0, autoPlay: _player.playing);

    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('Queue cleared'),
          action: SnackBarAction(
            label: 'UNDO',
            onPressed: () {
              _restoreQueue(previousQueue, previousCurrentTrackId);
            },
          ),
        ),
      );
  }

  Future<void> _saveQueueAsPlaylist() async {
    if (_queue.isEmpty) {
      return;
    }

    final now = DateTime.now();
    final name = 'Queue Mix ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final playlist = DemoPlaylist(
      id: 'pl-user-${now.millisecondsSinceEpoch}',
      name: name,
      description: 'Saved from queue',
      tracks: List<DemoTrack>.of(_queue),
    );

    setState(() {
      demoPlaylists.insert(0, playlist);
      _playlistTracks[playlist.id] = List<DemoTrack>.of(_queue);
      _activePlaylistId = playlist.id;
    });

    await _persistUiState();

    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text('Saved "$name" to Library')));
  }

  void _toggleOffline(DemoTrack track) {
    setState(() {
      if (_downloadedTrackIds.contains(track.id)) {
        _downloadedTrackIds.remove(track.id);
        _downloadedTrackCache.remove(track.id);
      } else {
        _downloadedTrackIds.add(track.id);
        _downloadedTrackCache[track.id] = track;
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

  Widget _buildDiscoverShelf(String title, List<DemoTrack> tracks) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
              Text('${tracks.length} tracks', style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12)),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 214,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: tracks.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final track = tracks[index];
                final inQueueIndex = _queue.indexWhere((item) => item.id == track.id);
                return GestureDetector(
                  onTap: () => _playOrQueueTrack(track, queueIndex: inQueueIndex >= 0 ? inQueueIndex : null),
                  child: Container(
                    width: 148,
                    decoration: BoxDecoration(
                      color: const Color(0x281A2B54),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0x2FAFC2FF)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                          child: AspectRatio(
                            aspectRatio: 1,
                            child: Image.network(
                              track.artUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                color: const Color(0x2A203869),
                                child: const Icon(Icons.music_note_rounded, color: Color(0xFFC3D2F5)),
                              ),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 10, 10, 0),
                          child: Text(
                            track.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 4, 10, 0),
                          child: Text(
                            track.artist,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoverPage() {
    final filteredTracks = _discoverRemoteTracks;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Discover', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        const Text('Search YouTube for music or use local files from your device', style: TextStyle(color: Color(0xFFB7C7EB))),
        const SizedBox(height: 18),
        _heroCard(),
        const SizedBox(height: 16),
        if (_discoverShelfLoading)
          const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                SizedBox(width: 8),
                Text('Loading trending and latest music...'),
              ],
            ),
          ),
        if (_discoverShelves.isNotEmpty) ...[
          ..._discoverShelves.entries.map((entry) => _buildDiscoverShelf(entry.key, entry.value)),
          const SizedBox(height: 6),
        ],
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
        if (_discoverSearching)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                SizedBox(width: 8),
                Text('Searching online tracks...'),
              ],
            ),
          ),
        if (_discoverSearchError != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              _discoverSearchError!,
              style: const TextStyle(color: Color(0xFFFFB4B4), fontSize: 12),
            ),
          ),
        if (_discoverQuery.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${filteredTracks.length} results for "${_discoverQuery.trim()}"',
              style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12),
            ),
          ),
        Text('Top Songs', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        if (filteredTracks.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Text(
              'No YouTube results yet. Try a different query or use the trending sections above.',
              style: TextStyle(color: Color(0xFFB7C7EB)),
            ),
          )
        else
          ...filteredTracks.asMap().entries.map(
                (entry) => _trackRow(
                  track: entry.value,
                  queueIndex: _queue.indexWhere((item) => item.id == entry.value.id),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: () => _addToQueueNext(entry.value),
                        icon: const Icon(Icons.queue_music_rounded, color: Color(0xFFC3D2F5)),
                      ),
                      IconButton(
                        onPressed: () => _toggleLikedTrack(entry.value),
                        icon: Icon(
                          _likedTrackIds.contains(entry.value.id)
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          color: _likedTrackIds.contains(entry.value.id)
                              ? const Color(0xFFFF8FA3)
                              : const Color(0xFFC3D2F5),
                        ),
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
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Library', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              // Tab buttons
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _LibraryTabButton(
                      label: 'Playlists',
                      icon: Icons.playlist_play_rounded,
                      isSelected: _libraryTabIndex == 0,
                      onPressed: () => setState(() => _libraryTabIndex = 0),
                    ),
                    const SizedBox(width: 10),
                    _LibraryTabButton(
                      label: 'Downloads',
                      icon: Icons.download_done_rounded,
                      isSelected: _libraryTabIndex == 1,
                      onPressed: () => setState(() => _libraryTabIndex = 1),
                    ),
                    const SizedBox(width: 10),
                    _LibraryTabButton(
                      label: 'Free Music',
                      icon: Icons.music_note_rounded,
                      isSelected: _libraryTabIndex == 2,
                      onPressed: () => setState(() => _libraryTabIndex = 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
        Expanded(
          child: IndexedStack(
            index: _libraryTabIndex,
            children: [
              // Tab 0: Liked Songs
              ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
                children: [
                  Text('Liked Songs', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  if (_likedTracks.isEmpty)
                    const Text(
                      'Tap the heart icon on any song to save it here.',
                      style: TextStyle(color: Color(0xFFB7C7EB)),
                    )
                  else
                    ..._likedTracks.map(
                      (track) => _trackRow(
                        track: track,
                        queueIndex: _queue.indexWhere((item) => item.id == track.id),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              onPressed: () => _addToQueue(track),
                              icon: const Icon(Icons.queue_music_rounded, color: Color(0xFFC3D2F5)),
                            ),
                            IconButton(
                              onPressed: () => _toggleLikedTrack(track),
                              icon: const Icon(Icons.favorite_rounded, color: Color(0xFFFF8FA3)),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              // Tab 1: Downloads (Local & Offline)
              ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
                children: [
                  Text('Local Device Audio', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.topRight,
                    child: TextButton.icon(
                      onPressed: _loadDeviceAudio,
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Refresh'),
                    ),
                  ),
                  if (_deviceAudioLoading)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                          SizedBox(width: 8),
                          Text('Scanning local music files...'),
                        ],
                      ),
                    )
                  else if (_deviceAudioError != null)
                    Text(_deviceAudioError!, style: const TextStyle(color: Color(0xFFFFB4B4)))
                  else if (_deviceSongs.isEmpty)
                    const Text(
                      'No local audio files found on this device yet.',
                      style: TextStyle(color: Color(0xFFB7C7EB)),
                    )
                  else
                    ..._deviceSongs.map(
                          (song) => _trackRow(
                            track: _demoTrackFromLocalSong(song),
                            queueIndex: _queue.indexWhere((item) => item.id == 'local-${song.id}'),
                            onTap: () => _playLocalSong(song),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () => _toggleLikedTrack(_demoTrackFromLocalSong(song)),
                                  icon: Icon(
                                    _likedTrackIds.contains('local-${song.id}')
                                        ? Icons.favorite_rounded
                                        : Icons.favorite_border_rounded,
                                    color: _likedTrackIds.contains('local-${song.id}')
                                        ? const Color(0xFFFF8FA3)
                                        : const Color(0xFFC3D2F5),
                                  ),
                                ),
                                const Icon(Icons.folder_rounded, color: Color(0xFFC3D2F5)),
                              ],
                            ),
                            subtitleSuffix: 'Local file',
                          ),
                        ),
                  if (_localPlaybackDebug != null) ...[
                    const SizedBox(height: 10),
                    Text(
                      'Local playback debug: $_localPlaybackDebug',
                      style: const TextStyle(color: Color(0xFFFFB4B4), fontSize: 11),
                    ),
                  ],
                  const SizedBox(height: 24),
                  Text('Saved for Offline', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  if (_downloadedTracks.isEmpty)
                    const Text(
                      'No songs saved yet for offline playback.',
                      style: TextStyle(color: Color(0xFFB7C7EB)),
                    )
                  else
                    ..._downloadedTracks.asMap().entries.map(
                          (entry) => _trackRow(
                            track: entry.value,
                            queueIndex: _queue.indexWhere((item) => item.id == entry.value.id),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () => _toggleLikedTrack(entry.value),
                                  icon: Icon(
                                    _likedTrackIds.contains(entry.value.id)
                                        ? Icons.favorite_rounded
                                        : Icons.favorite_border_rounded,
                                    color: _likedTrackIds.contains(entry.value.id)
                                        ? const Color(0xFFFF8FA3)
                                        : const Color(0xFFC3D2F5),
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => _toggleOffline(entry.value),
                                  icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFC3D2F5)),
                                ),
                              ],
                            ),
                            subtitleSuffix: 'Offline',
                          ),
                        ),
                ],
              ),
              // Tab 2: Royalty-Free Music Services
              ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
                children: [
                  Text(
                    'Free & Royalty-Free Music',
                    style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Download music from these copyright-free sources and add to your uploads or projects',
                    style: TextStyle(color: Color(0xFFB7C7EB), fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  ...royaltyFreeServices.map((service) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: const Color(0x261A2B54),
                        border: Border.all(color: const Color(0x2FAFC2FF)),
                      ),
                      child: ListTile(
                        title: Row(
                          children: [
                            Text(service.icon, style: const TextStyle(fontSize: 20)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(service.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  Text(
                                    service.category,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF93A6D1),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            service.description,
                            style: const TextStyle(fontSize: 12, color: Color(0xFFB7C7EB)),
                          ),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.open_in_new_rounded, color: Color(0xFF8AAFFF)),
                          onPressed: () async {
                            final uri = Uri.parse(service.url);
                            final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
                            if (!opened && context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Could not open ${service.name}')),
                              );
                            }
                          },
                        ),
                        isThreeLine: true,
                      ),
                    );
                  }),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsPage() {
    final themeOptions = <({String label, String subtitle, int value, Color accent})>[
      (
        label: 'Midnight',
        subtitle: 'Classic blue 7K theme',
        value: 0,
        accent: const Color(0xFF8AAFFF),
      ),
      (
        label: 'Aurora',
        subtitle: 'Green glass palette',
        value: 1,
        accent: const Color(0xFF76E7C4),
      ),
      (
        label: 'Ember',
        subtitle: 'Warm sunset palette',
        value: 2,
        accent: const Color(0xFFFFB36B),
      ),
    ];

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Settings', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        const Text(
          'Adjust the look and behavior of the app',
          style: TextStyle(color: Color(0xFFB7C7EB)),
        ),
        const SizedBox(height: 22),
        Text('Theme', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...themeOptions.map(
          (option) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              color: _themePreset == option.value ? option.accent.withOpacity(0.18) : const Color(0x261A2B54),
              border: Border.all(
                color: _themePreset == option.value ? option.accent : const Color(0x2FAFC2FF),
              ),
            ),
            child: RadioListTile<int>(
              value: option.value,
              groupValue: _themePreset,
              onChanged: (value) {
                if (value != null) {
                  _setThemePreset(value);
                }
              },
              activeColor: option.accent,
              title: Text(option.label),
              subtitle: Text(option.subtitle),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text('App Notes', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        _SettingsCard(
          icon: Icons.favorite_rounded,
          title: 'Liked songs',
          subtitle: 'Use the heart icon on search results to save songs to your library.',
        ),
        const SizedBox(height: 12),
        _SettingsCard(
          icon: Icons.download_done_rounded,
          title: 'Downloads',
          subtitle: 'The Downloads tab shows local device audio and saved offline items.',
        ),
        const SizedBox(height: 12),
        _SettingsCard(
          icon: Icons.smart_display_rounded,
          title: 'YouTube search',
          subtitle: 'Search results come from the secure Vercel API at music.7kc.me.',
        ),
      ],
    );
  }

  Widget _buildNowPlayingPage() {
    final track = _currentTrack;
    final isYoutube = _isYoutubeTrack(track);
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
        if (isYoutube)
          (_youtubeExternalPlaybackOnly
              ? Container(
                  height: 280,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    color: const Color(0x261A2B54),
                    border: Border.all(color: const Color(0x2FAFC2FF)),
                  ),
                  child: const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        'This track opens directly in YouTube to avoid embedded playback restrictions.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFB7C7EB), height: 1.4),
                      ),
                    ),
                  ),
                )
              : ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: SizedBox(
                    height: 280,
                    child: WebViewWidget(controller: _youtubeController),
                  ),
                ))
        else
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
        if (!isYoutube)
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
          )
        else
          Text(
            _youtubeExternalPlaybackOnly
                ? 'Playback opens in the YouTube app/browser.'
                : 'Playing in embedded YouTube view.',
            style: const TextStyle(color: Color(0xFFB7C7EB)),
          ),
        if (isYoutube && _activeYouTubeVideoId != null) ...[
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerLeft,
            child: OutlinedButton.icon(
              onPressed: () => _openYoutubeExternal(_activeYouTubeVideoId!),
              icon: const Icon(Icons.open_in_new_rounded),
              label: const Text('Watch on YouTube'),
            ),
          ),
        ],
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _glassIcon(
              _shuffleEnabled ? Icons.shuffle_on_rounded : Icons.shuffle_rounded,
              onTap: _toggleShuffleMode,
            ),
            _glassIcon(Icons.skip_previous_rounded, onTap: _previousTrackSafe),
            if (isYoutube)
              GestureDetector(
                onTap: _activeYouTubeVideoId == null ? () { unawaited(_loadYoutubeTrack(track)); } : null,
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
                  child: const Icon(Icons.play_arrow_rounded, color: Color(0xFF1D2A55), size: 46),
                ),
              )
            else
              StreamBuilder<bool>(
                stream: _player.playingStream,
                builder: (context, snapshot) {
                  final isPlaying = snapshot.data ?? false;
                  return GestureDetector(
                    onTap: _ensureQueueReadyAndPlay,
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
            _glassIcon(Icons.skip_next_rounded, onTap: _nextTrackSafe),
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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Queue', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(
                      '${_queue.length} songs lined up • drag to reorder',
                      style: const TextStyle(color: Color(0xFFB7C7EB)),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_horiz_rounded, color: Color(0xFFC3D2F5)),
                onSelected: (value) {
                  if (value == 'save') {
                    _saveQueueAsPlaylist();
                  }
                  if (value == 'clear') {
                    _clearQueueWithUndo();
                  }
                },
                itemBuilder: (context) => const [
                  PopupMenuItem<String>(
                    value: 'save',
                    child: Text('Save Queue as Playlist'),
                  ),
                  PopupMenuItem<String>(
                    value: 'clear',
                    child: Text('Clear Queue'),
                  ),
                ],
              ),
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
                    queueIndex: index,
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
    required int queueIndex,
    required Widget trailing,
    String? subtitleSuffix,
    VoidCallback? onTap,
  }) {
    final isTrackInQueue = queueIndex >= 0 && queueIndex < _queue.length;
    final isCurrent = isTrackInQueue && queueIndex == _trackIndex && _queue[queueIndex].id == _currentTrack.id;
    final isLocalTrack = track.id.startsWith('local-');
    final localId = isLocalTrack ? int.tryParse(track.id.replaceFirst('local-', '')) : null;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: isCurrent ? const Color(0x3A8AAFFF) : const Color(0x261A2B54),
        border: Border.all(color: isCurrent ? const Color(0x7FAFD0FF) : const Color(0x2FAFC2FF)),
      ),
      child: ListTile(
        onTap: onTap ?? () => _playOrQueueTrack(track, queueIndex: isTrackInQueue ? queueIndex : null),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: isLocalTrack && localId != null
              ? QueryArtworkWidget(
                  id: localId,
                  type: ArtworkType.AUDIO,
                  nullArtworkWidget: Container(
                    width: 54,
                    height: 54,
                    color: const Color(0x2A203869),
                    child: const Icon(Icons.music_note_rounded, color: Color(0xFFC3D2F5)),
                  ),
                )
              : Image.network(
                  track.artUrl,
                  width: 54,
                  height: 54,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 54,
                    height: 54,
                    color: const Color(0x2A203869),
                    child: const Icon(Icons.music_note_rounded, color: Color(0xFFC3D2F5)),
                  ),
                ),
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
    _pageController.dispose();
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
      _buildSettingsPage(),
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
          child: Column(
            children: [
              if (_startupError != null)
                Container(
                  margin: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: const Color(0x4DB74562),
                    border: Border.all(color: const Color(0xFFE57373)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_rounded, size: 18, color: Color(0xFFE57373)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _startupError!,
                          style: const TextStyle(color: Color(0xFFFFCDD2), fontSize: 13),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton.icon(
                        onPressed: () => _loadQueue(initialIndex: 0, autoPlay: false),
                        icon: const Icon(Icons.refresh_rounded, size: 14),
                        label: const Text('Retry'),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          backgroundColor: const Color(0xFFE57373),
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              Expanded(
                  child: Stack(
                    children: [
                      PageView(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() => _currentTab = index);
                          _persistUiState();
                        },
                        children: pages,
                      ),
                      if (_loadingSource)
                        Container(
                          color: const Color(0x66101022),
                          child: const Center(child: CircularProgressIndicator()),
                        ),
                    ],
                  ),
              ),
              if (!_loadingSource && _currentTab != 2)
                _MiniPlayerDock(
                  track: _currentTrack,
                  playingStream: _player.playingStream,
                  onOpen: _openExpandedPlayer,
                  onTogglePlayPause: _ensureQueueReadyAndPlay,
                  onNext: _nextTrackSafe,
                ),
              Container(
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
                    _navChip(4, Icons.tune_rounded, 'Settings'),
                  ],
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
        _pageController.animateToPage(
          index,
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOut,
        );
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

class _LibraryTabButton extends StatelessWidget {
  const _LibraryTabButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0x3A8AAFFF) : const Color(0x261A2B54),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0x7FAFD0FF) : const Color(0x2FAFC2FF),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: isSelected ? const Color(0xFF8AAFFF) : const Color(0xFFC3D2F5)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFFE6EEFF) : const Color(0xFFB7C7EB),
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: const Color(0x261A2B54),
        border: Border.all(color: const Color(0x2FAFC2FF)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0x3A8AAFFF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFFEAF1FF), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 12)),
              ],
            ),
          ),
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
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
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
