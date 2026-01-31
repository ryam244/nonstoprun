import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/services/direction_service.dart';

/// 進行方向矢印ウィジェット
class DirectionArrow extends StatelessWidget {
  final LatLng? currentLocation;
  final List<LatLng> route;
  final DirectionService _directionService = DirectionService();

  DirectionArrow({
    super.key,
    required this.currentLocation,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    // 現在地がない、またはルートが空の場合は何も表示しない
    if (currentLocation == null || route.isEmpty) {
      return const SizedBox.shrink();
    }

    // 次のウェイポイントを見つける
    final nextWaypoint = _directionService.findNextWaypoint(
      currentLocation!,
      route,
    );

    if (nextWaypoint == null) {
      return const SizedBox.shrink();
    }

    // 方位角を計算
    final bearing = _directionService.calculateBearing(
      currentLocation!,
      nextWaypoint,
    );

    // 方向アイコンとテキストを取得
    final directionIcon = _directionService.getDirectionIcon(bearing);
    final directionText = _directionService.getDirectionText(bearing);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 方向アイコン
          Icon(
            _getIconData(directionIcon),
            size: 64,
            color: AppColors.primary,
          ),
          const SizedBox(height: 8),
          // 方向テキスト
          Text(
            directionText,
            style: AppTypography.headline.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  /// DirectionIconからIconDataに変換
  IconData _getIconData(DirectionIcon icon) {
    switch (icon) {
      case DirectionIcon.straight:
        return Icons.arrow_upward;
      case DirectionIcon.slightRight:
        return Icons.north_east;
      case DirectionIcon.right:
        return Icons.turn_right;
      case DirectionIcon.sharpRight:
        return Icons.turn_sharp_right;
      case DirectionIcon.uTurn:
        return Icons.u_turn_right;
      case DirectionIcon.sharpLeft:
        return Icons.turn_sharp_left;
      case DirectionIcon.left:
        return Icons.turn_left;
      case DirectionIcon.slightLeft:
        return Icons.north_west;
    }
  }
}
