import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/voice_navigation_service.dart';

/// 音声ナビゲーションサービスプロバイダー
final voiceNavigationServiceProvider = Provider<VoiceNavigationService>((ref) {
  final service = VoiceNavigationService();
  service.initialize();

  ref.onDispose(() {
    service.dispose();
  });

  return service;
});

/// 音声ナビゲーション有効/無効状態プロバイダー
final voiceNavigationEnabledProvider = StateProvider<bool>((ref) => true);
