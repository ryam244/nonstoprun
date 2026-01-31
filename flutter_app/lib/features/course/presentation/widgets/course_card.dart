import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/course.dart';
import '../../../map/domain/road_segment.dart';
import 'elevation_chart.dart';

/// コース情報カード
class CourseCard extends StatelessWidget {
  final Course course;
  final VoidCallback onTap;

  const CourseCard({
    super.key,
    required this.course,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow.withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(AppTheme.spacingMd),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // コース名
            Row(
              children: [
                Text(
                  course.routeTypeIcon,
                  style: const TextStyle(fontSize: 20),
                ),
                const SizedBox(width: AppTheme.spacingSm),
                Expanded(
                  child: Text(
                    course.name,
                    style: AppTypography.headline,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppTheme.spacingMd),

            // 統計情報
            Row(
              children: [
                // 信号数
                _StatItem(
                  icon: Icons.traffic,
                  iconColor: course.signalCount == 0
                      ? AppColors.success
                      : AppColors.warning,
                  label: '信号',
                  value: '${course.signalCount}回',
                ),

                const SizedBox(width: AppTheme.spacingMd),

                // 緑地率
                _StatItem(
                  icon: Icons.park,
                  iconColor: AppColors.park,
                  label: '緑地率',
                  value: '${course.greenRatio}%',
                ),

                const SizedBox(width: AppTheme.spacingMd),

                // 高低差
                _StatItem(
                  icon: Icons.terrain,
                  iconColor: AppColors.textSecondary,
                  label: '累積標高',
                  value: '${course.elevationGain}m',
                ),
              ],
            ),

            const SizedBox(height: AppTheme.spacingMd),

            // 高低差グラフ
            if (course.elevations != null && course.elevations!.isNotEmpty) ...[
              const Text(
                '高低差',
                style: AppTypography.caption1,
              ),
              const SizedBox(height: AppTheme.spacingXs),
              ElevationChart(
                elevations: course.elevations!,
                height: 100,
              ),
              const SizedBox(height: AppTheme.spacingMd),
            ],

            // 路面タイプ
            if (course.surfaceRatios != null && course.surfaceRatios!.isNotEmpty) ...[
              const Text(
                '路面タイプ',
                style: AppTypography.caption1,
              ),
              const SizedBox(height: AppTheme.spacingXs),
              Wrap(
                spacing: AppTheme.spacingSm,
                runSpacing: AppTheme.spacingXs,
                children: course.surfaceRatios!.entries.map((entry) {
                  return _SurfaceTypeChip(
                    surfaceType: entry.key,
                    percentage: entry.value,
                  );
                }).toList(),
              ),
              const SizedBox(height: AppTheme.spacingMd),
            ],

            // 距離と推定時間
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.straighten,
                      size: AppTheme.iconSizeSm,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppTheme.spacingXs),
                    Text(
                      '${course.distance.toStringAsFixed(1)} km',
                      style: AppTypography.subheadline.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const Icon(
                      Icons.schedule,
                      size: AppTheme.iconSizeSm,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: AppTheme.spacingXs),
                    Text(
                      '約${course.estimatedDuration}分',
                      style: AppTypography.subheadline,
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: AppTheme.spacingMd),

            // スタートボタン
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    vertical: AppTheme.spacingMd,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.directions_run, size: AppTheme.iconSizeMd),
                    const SizedBox(width: AppTheme.spacingSm),
                    Text(
                      'このコースで走る',
                      style: AppTypography.button,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 統計アイテム
class _StatItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: AppTheme.iconSizeSm,
                color: iconColor,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.caption1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTypography.subheadline.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// 路面タイプチップ
class _SurfaceTypeChip extends StatelessWidget {
  final SurfaceType surfaceType;
  final int percentage;

  const _SurfaceTypeChip({
    required this.surfaceType,
    required this.percentage,
  });

  @override
  Widget build(BuildContext context) {
    final info = _getSurfaceTypeInfo(surfaceType);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.spacingSm,
        vertical: AppTheme.spacingXs,
      ),
      decoration: BoxDecoration(
        color: info.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
        border: Border.all(
          color: info.color.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            info.icon,
            size: 16,
            color: info.color,
          ),
          const SizedBox(width: 4),
          Text(
            '${info.label} $percentage%',
            style: AppTypography.caption1.copyWith(
              color: info.color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  _SurfaceTypeInfo _getSurfaceTypeInfo(SurfaceType type) {
    switch (type) {
      case SurfaceType.paved:
        return _SurfaceTypeInfo(
          icon: Icons.route,
          label: '舗装路',
          color: AppColors.primary,
        );
      case SurfaceType.unpaved:
        return _SurfaceTypeInfo(
          icon: Icons.terrain,
          label: '土',
          color: const Color(0xFF8B4513),
        );
      case SurfaceType.gravel:
        return _SurfaceTypeInfo(
          icon: Icons.grain,
          label: '砂利',
          color: const Color(0xFF808080),
        );
      case SurfaceType.grass:
        return _SurfaceTypeInfo(
          icon: Icons.grass,
          label: '芝生',
          color: AppColors.park,
        );
      case SurfaceType.ground:
        return _SurfaceTypeInfo(
          icon: Icons.landscape,
          label: '地面',
          color: const Color(0xFFA0522D),
        );
      case SurfaceType.unknown:
        return _SurfaceTypeInfo(
          icon: Icons.help_outline,
          label: '不明',
          color: AppColors.textSecondary,
        );
    }
  }
}

/// 路面タイプ情報
class _SurfaceTypeInfo {
  final IconData icon;
  final String label;
  final Color color;

  _SurfaceTypeInfo({
    required this.icon,
    required this.label,
    required this.color,
  });
}
