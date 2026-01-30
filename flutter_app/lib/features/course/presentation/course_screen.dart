import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../domain/entities/course.dart';
import 'widgets/course_card.dart';
import 'widgets/map_view.dart';

/// コース提案画面: 地図とコースカルーセル
class CourseScreen extends ConsumerStatefulWidget {
  final double distance;

  const CourseScreen({
    super.key,
    required this.distance,
  });

  @override
  ConsumerState<CourseScreen> createState() => _CourseScreenState();
}

class _CourseScreenState extends ConsumerState<CourseScreen> {
  int _selectedCourseIndex = 0;
  final PageController _pageController = PageController();

  // TODO: 後でAPIから取得する
  late List<Course> _mockCourses;

  @override
  void initState() {
    super.initState();
    _mockCourses = _generateMockCourses();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<Course> _generateMockCourses() {
    return [
      Course(
        id: '1',
        name: '信号ゼロ！公園メインの快適${widget.distance.toStringAsFixed(1)}km',
        distance: widget.distance,
        signalCount: 0,
        greenRatio: 90,
        elevationGain: 15,
        routeType: RouteType.park,
        coordinates: [],
      ),
      Course(
        id: '2',
        name: '緑道80%！木陰が気持ちいい${widget.distance.toStringAsFixed(1)}km',
        distance: widget.distance + 0.1,
        signalCount: 1,
        greenRatio: 80,
        elevationGain: 25,
        routeType: RouteType.greenway,
        coordinates: [],
      ),
      Course(
        id: '3',
        name: '完全フラットな${widget.distance.toStringAsFixed(1)}km',
        distance: widget.distance - 0.1,
        signalCount: 2,
        greenRatio: 40,
        elevationGain: 5,
        routeType: RouteType.flat,
        coordinates: [],
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 地図表示
          MapView(
            courses: _mockCourses,
            selectedCourseIndex: _selectedCourseIndex,
          ),

          // トップバー
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.spacingMd,
                  vertical: AppTheme.spacingSm,
                ),
                decoration: BoxDecoration(
                  color: AppColors.background.withValues(alpha: 0.95),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.shadow,
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: AppTheme.spacingSm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${widget.distance.toStringAsFixed(1)} kmのコース',
                            style: AppTypography.headline,
                          ),
                          Text(
                            '${_mockCourses.length}件のコースが見つかりました',
                            style: AppTypography.caption1,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // コースカルーセル
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ページインジケーター
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      _mockCourses.length,
                      (index) => Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacingXs,
                        ),
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _selectedCourseIndex == index
                              ? AppColors.primary
                              : AppColors.disabled,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingSm),

                  // カルーセル
                  SizedBox(
                    height: 220,
                    child: PageView.builder(
                      controller: _pageController,
                      onPageChanged: (index) {
                        setState(() {
                          _selectedCourseIndex = index;
                        });
                      },
                      itemCount: _mockCourses.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.spacingMd,
                          ),
                          child: CourseCard(
                            course: _mockCourses[index],
                            onTap: () {
                              // TODO: ナビゲーション開始
                            },
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMd),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
