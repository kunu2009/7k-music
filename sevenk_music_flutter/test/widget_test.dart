import 'package:flutter_test/flutter_test.dart';

import 'package:sevenk_music_flutter/main.dart';

void main() {
  testWidgets('SevenKMusicApp renders root shell', (WidgetTester tester) async {
    await tester.pumpWidget(const SevenKMusicApp());
    expect(find.byType(SevenKMusicApp), findsOneWidget);
  });
}
