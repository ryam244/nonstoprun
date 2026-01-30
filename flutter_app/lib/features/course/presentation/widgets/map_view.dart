import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../domain/entities/course.dart';

/// 地図表示ウィジェット
/// TODO: Mapbox SDKを統合
class MapView extends StatelessWidget {
  final List<Course> courses;
  final int selectedCourseIndex;

  const MapView({
    super.key,
    required this.courses,
    required this.selectedCourseIndex,
  });

  @override
  Widget build(BuildContext context) {
    // TODO: Mapbox地図を表示
    // 現在はプレースホルダー表示
    return Container(
      color: AppColors.backgroundSecondary,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.map,
              size: 64,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              '地図を表示中...',
              style: AppTypography.headline.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Mapbox統合予定',
              style: AppTypography.caption1,
            ),
            const SizedBox(height: 24),
            if (courses.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.symmetric(horizontal: 32),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      '選択中のコース:',
                      style: AppTypography.caption1,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      courses[selectedCourseIndex].name,
                      style: AppTypography.subheadline.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
