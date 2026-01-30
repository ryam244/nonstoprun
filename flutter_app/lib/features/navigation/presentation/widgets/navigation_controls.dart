import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/navigation_state.dart';
import '../../providers/navigation_provider.dart';
import '../../../../core/theme/app_colors.dart';

/// ナビゲーションコントロール
class NavigationControls extends ConsumerWidget {
  final NavigationState navigationState;

  const NavigationControls({
    super.key,
    required this.navigationState,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // 停止ボタン
          if (navigationState.status == NavigationStatus.running ||
              navigationState.status == NavigationStatus.paused)
            _buildControlButton(
              icon: Icons.stop,
              label: '停止',
              color: Colors.red,
              onPressed: () => _showStopConfirmation(context, ref),
            ),

          // 開始/一時停止/再開ボタン
          _buildMainButton(context, ref),

          // 空のスペース（レイアウトバランス用）
          if (navigationState.status == NavigationStatus.ready)
            const SizedBox(width: 64),
        ],
      ),
    );
  }

  Widget _buildMainButton(BuildContext context, WidgetRef ref) {
    switch (navigationState.status) {
      case NavigationStatus.ready:
        return _buildPrimaryButton(
          icon: Icons.play_arrow,
          label: 'スタート',
          onPressed: () => _handleStart(context, ref),
        );

      case NavigationStatus.running:
        return _buildControlButton(
          icon: Icons.pause,
          label: '一時停止',
          color: AppColors.greenwayRouteColor,
          onPressed: () => ref.read(navigationProvider.notifier).pause(),
        );

      case NavigationStatus.paused:
        return _buildPrimaryButton(
          icon: Icons.play_arrow,
          label: '再開',
          onPressed: () => _handleResume(context, ref),
        );

      case NavigationStatus.idle:
      case NavigationStatus.completed:
        return const SizedBox.shrink();
    }
  }

  /// スタート処理（エラーハンドリング付き）
  Future<void> _handleStart(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(navigationProvider.notifier).start();
    } catch (e) {
      if (context.mounted) {
        _showErrorDialog(context, 'ナビゲーションを開始できませんでした', e.toString());
      }
    }
  }

  /// 再開処理（エラーハンドリング付き）
  Future<void> _handleResume(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(navigationProvider.notifier).resume();
    } catch (e) {
      if (context.mounted) {
        _showErrorDialog(context, 'ナビゲーションを再開できませんでした', e.toString());
      }
    }
  }

  Widget _buildPrimaryButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.parkRouteColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        elevation: 4,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 32),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return IconButton(
      onPressed: onPressed,
      icon: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  void _showStopConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ナビゲーション停止'),
        content: const Text('ナビゲーションを停止しますか？\n記録は保存されません。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () {
              ref.read(navigationProvider.notifier).stop();
              Navigator.of(context).pop();
              Navigator.of(context).pop(); // ナビゲーション画面を閉じる
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('停止'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
