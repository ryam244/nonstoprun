import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/location_provider.dart';
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

        setState(() {
          _courses = generatedCourses;
        });
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // コースが生成されていない場合はローディング表示
    if (_courses.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: Text('${widget.distance.toStringAsFixed(1)} kmのコース'),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('コースを生成中...'),
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
                            onTap: () {
                              // ナビゲーション画面に遷移
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => NavigationScreen(
                                    course: _courses[index],
                                  ),
                                ),
                              );
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
