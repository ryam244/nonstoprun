import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/course.dart';

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
