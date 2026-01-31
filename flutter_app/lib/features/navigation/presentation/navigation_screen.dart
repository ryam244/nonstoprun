import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../course/domain/entities/course.dart';
import '../domain/entities/navigation_state.dart';
import '../providers/navigation_provider.dart';
import '../../../core/providers/voice_navigation_provider.dart';
import 'widgets/navigation_map_view.dart';
import 'widgets/navigation_stats.dart';
import 'widgets/navigation_controls.dart';
import 'widgets/off_route_alert.dart';
import 'widgets/direction_arrow.dart';

/// ナビゲーション画面
class NavigationScreen extends ConsumerStatefulWidget {
  final Course course;

  const NavigationScreen({
    super.key,
    required this.course,
  });

  @override
  ConsumerState<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends ConsumerState<NavigationScreen> {
  NavigationStatus? _previousStatus;
  bool _previousOffRouteState = false;
  double _lastAnnouncedDistance = 0.0;

  @override
  void initState() {
    super.initState();
    // ナビゲーションを準備
    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        ref.read(navigationProvider.notifier).prepare(widget.course);
      } catch (e) {
        // コースデータが無効な場合はエラーダイアログを表示して戻る
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('エラー'),
              content: Text('コースデータが無効です: $e'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pop();
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    });
  }

  /// 音声案内を処理
  void _handleVoiceNavigation(NavigationState state) {
    final voiceService = ref.read(voiceNavigationServiceProvider);
    final isEnabled = ref.read(voiceNavigationEnabledProvider);

    if (!isEnabled) return;

    // 状態変化による音声案内
    if (_previousStatus != state.status) {
      switch (state.status) {
        case NavigationStatus.running:
          if (_previousStatus == NavigationStatus.ready) {
            voiceService.announceStart(state.course?.distance ?? 0);
          } else if (_previousStatus == NavigationStatus.paused) {
            voiceService.announceResume();
          }
          break;
        case NavigationStatus.paused:
          voiceService.announcePause();
          break;
        case NavigationStatus.completed:
          voiceService.announceComplete(
            state.distanceTraveled,
            state.elapsedTime,
          );
          break;
        default:
          break;
      }
      _previousStatus = state.status;
    }

    // ルート逸脱の音声案内（1回のみ）
    if (state.isOffRoute && !_previousOffRouteState) {
      voiceService.announceOffRoute();
    }
    _previousOffRouteState = state.isOffRoute;

    // 1km毎の距離案内
    if (state.status == NavigationStatus.running) {
      final currentKm = state.distanceTraveled.floor().toDouble();
      if (currentKm > _lastAnnouncedDistance && currentKm % 1 == 0) {
        voiceService.announceDistance(
          state.distanceTraveled,
          state.distanceRemaining,
        );
        _lastAnnouncedDistance = currentKm;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final navigationState = ref.watch(navigationProvider);

    // 音声案内を処理
    _handleVoiceNavigation(navigationState);

    return PopScope(
      canPop: navigationState.status != NavigationStatus.running,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        // 走行中の場合は確認ダイアログを表示
        final shouldPop = await _showExitConfirmation(context);
        if (shouldPop == true && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: Stack(
          children: [
            // 地図
            NavigationMapView(
              course: widget.course,
              currentLocation: navigationState.currentLocation,
              traveledPath: navigationState.traveledPath,
            ),

            // ルート逸脱アラート
            if (navigationState.isOffRoute && navigationState.status == NavigationStatus.running)
              const Positioned(
                top: 60,
                left: 16,
                right: 16,
                child: OffRouteAlert(),
              ),

            // 統計情報
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              left: 16,
              right: 16,
              child: NavigationStats(navigationState: navigationState),
            ),

            // 進行方向矢印（ナビゲーション実行中のみ表示）
            if (navigationState.status == NavigationStatus.running &&
                navigationState.currentLocation != null)
              Positioned(
                top: MediaQuery.of(context).padding.top + 140,
                left: 0,
                right: 0,
                child: Center(
                  child: DirectionArrow(
                    currentLocation: navigationState.currentLocation,
                    route: widget.course.coordinates,
                  ),
                ),
              ),

            // コントロールボタン
            Positioned(
              bottom: MediaQuery.of(context).padding.bottom + 32,
              left: 16,
              right: 16,
              child: NavigationControls(navigationState: navigationState),
            ),

            // 完了ダイアログ
            if (navigationState.status == NavigationStatus.completed)
              _buildCompletionDialog(context, navigationState),
          ],
        ),
      ),
    );
  }

  /// 完了ダイアログ
  Widget _buildCompletionDialog(BuildContext context, NavigationState state) {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Card(
          margin: const EdgeInsets.all(32),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.check_circle,
                  color: Colors.green,
                  size: 64,
                ),
                const SizedBox(height: 16),
                const Text(
                  'お疲れ様でした！',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                _buildStat('距離', '${state.distanceTraveled.toStringAsFixed(2)} km'),
                _buildStat('時間', _formatDuration(state.elapsedTime)),
                _buildStat('平均ペース', '${state.averagePace.toStringAsFixed(1)} 分/km'),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(navigationProvider.notifier).stop();
                      Navigator.of(context).pop();
                    },
                    child: const Text('完了'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 16),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '$hours:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    } else {
      return '$minutes:${seconds.toString().padLeft(2, '0')}';
    }
  }

  /// 終了確認ダイアログ
  Future<bool?> _showExitConfirmation(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ナビゲーション終了'),
        content: const Text('ナビゲーションを終了しますか？\n記録は保存されません。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () {
              ref.read(navigationProvider.notifier).stop();
              Navigator.of(context).pop(true);
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('終了'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    // 画面が破棄される時にナビゲーションを停止
    if (mounted) {
      final status = ref.read(navigationProvider).status;
      if (status != NavigationStatus.completed && status != NavigationStatus.idle) {
        ref.read(navigationProvider.notifier).stop();
      }
    }
    super.dispose();
  }
}
