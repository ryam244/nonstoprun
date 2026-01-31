import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/navigation_state.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/providers/voice_navigation_provider.dart';

/// ナビゲーション統計情報
class NavigationStats extends ConsumerWidget {
  final NavigationState navigationState;

  const NavigationStats({
    super.key,
    required this.navigationState,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voiceEnabled = ref.watch(voiceNavigationEnabledProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 音声ON/OFFボタン
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                icon: Icon(
                  voiceEnabled ? Icons.volume_up : Icons.volume_off,
                  color: voiceEnabled ? AppColors.primary : Colors.grey,
                ),
                onPressed: () {
                  ref.read(voiceNavigationEnabledProvider.notifier).state = !voiceEnabled;
                  final service = ref.read(voiceNavigationServiceProvider);
                  service.setEnabled(!voiceEnabled);
                },
                tooltip: voiceEnabled ? '音声案内をOFF' : '音声案内をON',
              ),
            ],
          ),
          // メイン統計（距離と時間）
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildMainStat(
                label: '走行距離',
                value: navigationState.distanceTraveled.toStringAsFixed(2),
                unit: 'km',
                color: AppColors.parkRouteColor,
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.grey[300],
              ),
              _buildMainStat(
                label: '経過時間',
                value: _formatDuration(navigationState.elapsedTime),
                unit: '',
                color: AppColors.greenwayRouteColor,
              ),
            ],
          ),

          const SizedBox(height: 16),

          // サブ統計（ペースと残り距離）
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildSubStat(
                icon: Icons.speed,
                label: 'ペース',
                value: navigationState.currentPace > 0
                    ? '${navigationState.currentPace.toStringAsFixed(1)} 分/km'
                    : '--',
              ),
              _buildSubStat(
                icon: Icons.route,
                label: '残り',
                value: '${navigationState.distanceRemaining.toStringAsFixed(2)} km',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMainStat({
    required String label,
    required String value,
    required String unit,
    required Color color,
  }) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              if (unit.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(left: 4, bottom: 4),
                  child: Text(
                    unit,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubStat({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 16,
            color: Colors.grey[600],
          ),
          const SizedBox(width: 4),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[600],
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
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
}
