import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter/foundation.dart';

/// 音声ナビゲーションサービス
///
/// ランニング中の音声案内を管理します
class VoiceNavigationService {
  final FlutterTts _tts = FlutterTts();
  bool _isInitialized = false;
  bool _isEnabled = true;

  /// サービスを初期化
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // 日本語を設定
      await _tts.setLanguage('ja-JP');

      // 音声設定
      await _tts.setSpeechRate(0.5); // 話速（0.0〜1.0、0.5が標準）
      await _tts.setVolume(1.0); // 音量（0.0〜1.0）
      await _tts.setPitch(1.0); // 音の高さ（0.5〜2.0）

      // iOSの場合の設定
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        await _tts.setSharedInstance(true);
        await _tts.setIosAudioCategory(
          IosTextToSpeechAudioCategory.playback,
          [
            IosTextToSpeechAudioCategoryOptions.allowBluetooth,
            IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
            IosTextToSpeechAudioCategoryOptions.mixWithOthers,
          ],
          IosTextToSpeechAudioMode.voicePrompt,
        );
      }

      _isInitialized = true;
      debugPrint('VoiceNavigationService initialized');
    } catch (e) {
      debugPrint('Failed to initialize TTS: $e');
    }
  }

  /// 音声案内を有効/無効にする
  void setEnabled(bool enabled) {
    _isEnabled = enabled;
  }

  /// 音声案内が有効かどうか
  bool get isEnabled => _isEnabled;

  /// テキストを読み上げる
  Future<void> speak(String text) async {
    if (!_isEnabled || !_isInitialized) return;

    try {
      await _tts.speak(text);
      debugPrint('Speaking: $text');
    } catch (e) {
      debugPrint('Failed to speak: $e');
    }
  }

  /// 読み上げを停止
  Future<void> stop() async {
    try {
      await _tts.stop();
    } catch (e) {
      debugPrint('Failed to stop TTS: $e');
    }
  }

  /// ナビゲーション開始時の案内
  Future<void> announceStart(double distanceKm) async {
    await speak('ナビゲーションを開始します。${distanceKm.toStringAsFixed(1)}キロメートルのコースです。');
  }

  /// 一時停止時の案内
  Future<void> announcePause() async {
    await speak('ナビゲーションを一時停止しました。');
  }

  /// 再開時の案内
  Future<void> announceResume() async {
    await speak('ナビゲーションを再開します。');
  }

  /// コース完了時の案内
  Future<void> announceComplete(double distanceKm, Duration duration) async {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds.remainder(60);
    await speak(
      'お疲れ様でした。${distanceKm.toStringAsFixed(1)}キロメートルを、$minutes分$seconds秒で完走しました。',
    );
  }

  /// ルート逸脱時の案内
  Future<void> announceOffRoute() async {
    await speak('ルートから外れています。青いラインに沿って走ってください。');
  }

  /// 距離案内（1km毎）
  Future<void> announceDistance(double distanceKm, double remainingKm) async {
    await speak(
      '${distanceKm.toStringAsFixed(1)}キロメートル走行しました。残り${remainingKm.toStringAsFixed(1)}キロメートルです。',
    );
  }

  /// ペース案内
  Future<void> announcePace(double paceMinPerKm) async {
    final minutes = paceMinPerKm.floor();
    final seconds = ((paceMinPerKm - minutes) * 60).round();
    await speak('現在のペースは、1キロメートルあたり$minutes分$seconds秒です。');
  }

  /// 方向転換案内
  Future<void> announceTurn(String direction, double distanceMeters) async {
    if (distanceMeters < 50) {
      await speak('もうすぐ$directionです。');
    } else if (distanceMeters < 200) {
      await speak('${distanceMeters.round()}メートル先、$directionです。');
    }
  }

  /// カスタムメッセージを読み上げ
  Future<void> announceCustom(String message) async {
    await speak(message);
  }

  /// リソースを解放
  void dispose() {
    _tts.stop();
  }
}
