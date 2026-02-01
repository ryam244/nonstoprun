import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/location_provider.dart';
import '../../../core/services/elevation_service.dart';
import '../../map/providers/traffic_signal_provider.dart';
import '../../map/data/overpass_api_service.dart';
import '../../navigation/presentation/navigation_screen.dart';
import '../domain/entities/course.dart';
import '../domain/usecases/route_generator.dart';
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
  List<Course> _courses = [];
  final RouteGenerator _routeGenerator = RouteGenerator();
  final OverpassApiService _overpassApiService = OverpassApiService();
  final ElevationService _elevationService = ElevationService();

  @override
  void initState() {
    super.initState();

    // 信号データ、道路データ、公園データを取得してコースを生成
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final location = ref.read(locationProvider).location;
      if (location != null) {
        // 信号データを取得
        await ref.read(trafficSignalProvider.notifier).fetchTrafficSignals(
          center: location,
          radiusKm: widget.distance,
        );

        // 道路データと公園データを取得
        final roads = await _overpassApiService.getRoadSegments(
          center: location,
          radiusKm: widget.distance,
        );
        final parks = await _overpassApiService.getParks(
          center: location,
          radiusKm: widget.distance,
        );

        // 信号、道路、公園データを使ってコースを生成
        final signals = ref.read(trafficSignalProvider).signals;
        final generatedCourses = _routeGenerator.generateRoutes(
          center: location,
          distanceKm: widget.distance,
          signals: signals,
          roads: roads,
          parks: parks,
        );

        // 各コースに標高データを追加
        final coursesWithElevation = await _addElevationData(generatedCourses);

        setState(() {
          _courses = coursesWithElevation;
        });
      }
    });
  }

  /// 各コースに標高データを追加
  Future<List<Course>> _addElevationData(List<Course> courses) async {
    final coursesWithElevation = <Course>[];

    for (final course in courses) {
      try {
        // 標高データを取得
        final elevations = await _elevationService.getElevations(course.coordinates);

        // 累積標高を計算
        final elevationGain = _elevationService.calculateElevationGain(elevations);

        // 標高データと累積標高を含むコースを作成
        final updatedCourse = course.copyWith(
          elevations: elevations,
          elevationGain: elevationGain.round(),
        );

        coursesWithElevation.add(updatedCourse);
      } catch (e) {
        // 標高データ取得に失敗した場合は元のコースをそのまま使用
        debugPrint('Failed to fetch elevation data: $e');
        coursesWithElevation.add(course);
      }
    }

    return coursesWithElevation;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  /// プログレスステップを表示するウィジェット
  Widget _buildProgressStep(String label, bool isComplete) {
    return Row(
      children: [
        Icon(
          isComplete ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 20,
          color: isComplete ? AppColors.success : AppColors.textTertiary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: AppTypography.body.copyWith(
              color: isComplete ? AppColors.text : AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // コースが生成されていない場合はローディング表示
    if (_courses.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('${widget.distance.toStringAsFixed(1)} kmのコース'),
          backgroundColor: AppColors.background,
          elevation: 0,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // スタイリッシュなローディングアニメーション
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 80,
                    height: 80,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.primary.withValues(alpha: 0.3),
                      ),
                    ),
                  ),
                  const SizedBox(
                    width: 60,
                    height: 60,
                    child: CircularProgressIndicator(
                      strokeWidth: 4,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.primary,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.directions_run,
                    size: 32,
                    color: AppColors.primary,
                  ),
                ],
              ),
              const SizedBox(height: 32),
              Text(
                'コースを生成中...',
                style: AppTypography.headline.copyWith(
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '信号のない最適なルートを探しています',
                style: AppTypography.body.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // プログレスステップ表示
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 48),
                child: Column(
                  children: [
                    _buildProgressStep('📍 位置情報を取得', true),
                    const SizedBox(height: 8),
                    _buildProgressStep('🚦 信号データを収集', true),
                    const SizedBox(height: 8),
                    _buildProgressStep('🗺️ ルートを計算', true),
                    const SizedBox(height: 8),
                    _buildProgressStep('📊 高低差を分析', false),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          // 地図表示
          MapView(
            courses: _courses,
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
                            '${_courses.length}件のコースが見つかりました',
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
                      _courses.length,
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
                      itemCount: _courses.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.spacingMd,
                          ),
                          child: CourseCard(
                            course: _courses[index],
                            isSelected: _selectedCourseIndex == index,
                            onTap: () {
                              // タップでページを変更（選択）
                              _pageController.animateToPage(
                                index,
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMd),

                  // 確認ボタン
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacingMd,
                    ),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => NavigationScreen(
                                course: _courses[_selectedCourseIndex],
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            vertical: AppTheme.spacingMd,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle, size: 24),
                            const SizedBox(width: AppTheme.spacingSm),
                            Text(
                              'このコースで開始',
                              style: AppTypography.headline.copyWith(
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
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
