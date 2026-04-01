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
      home: const PremiumPlayerPage(),
    );
  }
}

class PremiumPlayerPage extends StatefulWidget {
  const PremiumPlayerPage({super.key});

  @override
  State<PremiumPlayerPage> createState() => _PremiumPlayerPageState();
}

class _PremiumPlayerPageState extends State<PremiumPlayerPage> {
  late final AudioPlayer _player;
  int _trackIndex = 0;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _init();
  }

  Future<void> _init() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

    final source = ConcatenatingAudioSource(
      children: demoTracks
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

    await _player.setAudioSource(source, initialIndex: 0);
    _player.currentIndexStream.listen((index) {
      if (!mounted || index == null) return;
      setState(() => _trackIndex = index);
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final track = demoTracks[_trackIndex];

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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Row(
                  children: [
                    _glassIcon(Icons.keyboard_arrow_down_rounded),
                    const Expanded(
                      child: Text(
                        'Now Playing',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                    ),
                    _glassIcon(Icons.more_horiz),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  height: 320,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    image: DecorationImage(
                      image: NetworkImage(track.artUrl),
                      fit: BoxFit.cover,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x80203878),
                        blurRadius: 40,
                        spreadRadius: 6,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Text(track.title, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text(track.artist, style: const TextStyle(color: Color(0xFFB7C7EB), fontSize: 15)),
                const SizedBox(height: 20),
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
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _glassIcon(Icons.skip_previous_rounded, onTap: _player.seekToPrevious),
                    const SizedBox(width: 18),
                    StreamBuilder<bool>(
                      stream: _player.playingStream,
                      builder: (context, snapshot) {
                        final isPlaying = snapshot.data ?? false;
                        return GestureDetector(
                          onTap: () => isPlaying ? _player.pause() : _player.play(),
                          child: Container(
                            width: 82,
                            height: 82,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [Color(0xFFEAF1FF), Color(0xFFCCD9FF)],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                              boxShadow: [
                                BoxShadow(color: Color(0x80A1B9FF), blurRadius: 30, spreadRadius: 4),
                              ],
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
                    const SizedBox(width: 18),
                    _glassIcon(Icons.skip_next_rounded, onTap: _player.seekToNext),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
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

  String _format(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
