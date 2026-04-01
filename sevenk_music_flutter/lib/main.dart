import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';

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
  });

  final String id;
  final String title;
  final String artist;
  final String audioUrl;
  final String artUrl;
}

const demoTracks = <DemoTrack>[
  DemoTrack(
    id: '1',
    title: 'Neon Horizon',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
  ),
  DemoTrack(
    id: '2',
    title: 'Night Pulse',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
  ),
  DemoTrack(
    id: '3',
    title: 'Blue Drift',
    artist: '7K Session',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600',
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
  int _currentTab = 0;
  int _trackIndex = 0;
  List<DemoTrack> _queue = List.of(demoTracks);
  LoopMode _loopMode = LoopMode.off;
  bool _shuffleEnabled = false;
  bool _loadingSource = true;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _init();
  }

  Future<void> _init() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

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

  DemoTrack get _currentTrack => _queue[_trackIndex];

  Future<void> _playTrackAt(int index) async {
    if (index < 0 || index >= _queue.length) return;
    await _player.seek(Duration.zero, index: index);
    await _player.play();
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
    await _loadQueue(initialIndex: nextCurrentIndex, autoPlay: _player.playing);
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

    await _loadQueue(initialIndex: nextIndex, autoPlay: _player.playing);
  }

  Widget _buildDiscoverPage() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Discover', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        const Text('Curated for your daily listening sessions', style: TextStyle(color: Color(0xFFB7C7EB))),
        const SizedBox(height: 18),
        Container(
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
                        onPressed: () => _playTrackAt(_trackIndex),
                        icon: const Icon(Icons.play_arrow_rounded),
                        label: const Text('Play Now'),
                        style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE8EFFF), foregroundColor: const Color(0xFF172955)),
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
        ),
        const SizedBox(height: 26),
        Text('Top Songs', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        ..._queue.asMap().entries.map(
              (entry) => _trackRow(
                track: entry.value,
                index: entry.key,
                trailing: IconButton(
                  onPressed: () => _addToQueueNext(entry.value),
                  icon: const Icon(Icons.queue_play_next_rounded, color: Color(0xFFC3D2F5)),
                ),
              ),
            ),
      ],
    );
  }

  Widget _buildLibraryPage() {
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
        Text('Your Queue', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ..._queue.asMap().entries.map(
              (entry) => _trackRow(
                track: entry.value,
                index: entry.key,
                trailing: IconButton(
                  onPressed: () => _removeFromQueue(entry.key),
                  icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFC3D2F5)),
                ),
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
      ],
    );
  }

  Widget _buildQueuePage() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
      children: [
        Text('Queue', style: GoogleFonts.sora(fontSize: 34, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Text('${_queue.length} songs lined up', style: const TextStyle(color: Color(0xFFB7C7EB))),
        const SizedBox(height: 14),
        ..._queue.asMap().entries.map(
              (entry) => _trackRow(
                track: entry.value,
                index: entry.key,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: () => _addToQueueNext(entry.value),
                      icon: const Icon(Icons.queue_play_next_rounded, color: Color(0xFFC3D2F5)),
                    ),
                    IconButton(
                      onPressed: () => _removeFromQueue(entry.key),
                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFC3D2F5)),
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }

  Widget _trackRow({
    required DemoTrack track,
    required int index,
    required Widget trailing,
  }) {
    final isCurrent = index == _trackIndex;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: isCurrent ? const Color(0x3A8AAFFF) : const Color(0x261A2B54),
        border: Border.all(color: isCurrent ? const Color(0x7FAFD0FF) : const Color(0x2FAFC2FF)),
      ),
      child: ListTile(
        onTap: () => _playTrackAt(index),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(track.artUrl, width: 54, height: 54, fit: BoxFit.cover),
        ),
        title: Text(track.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(track.artist, maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing: trailing,
      ),
    );
  }
  }

  @override
  void dispose() {
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
      onTap: () => setState(() => _currentTab = index),
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
