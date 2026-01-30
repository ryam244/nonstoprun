import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/constants/env_constants.dart';
import '../../../../core/providers/location_provider.dart';
import '../../../map/providers/traffic_signal_provider.dart';
import '../../domain/entities/course.dart';

/// 地図表示ウィジェット
class MapView extends ConsumerStatefulWidget {
  final List<Course> courses;
  final int selectedCourseIndex;

  const MapView({
    super.key,
    required this.courses,
    required this.selectedCourseIndex,
  });

  @override
  ConsumerState<MapView> createState() => _MapViewState();
}

class _MapViewState extends ConsumerState<MapView> {
  MapboxMap? _mapboxMap;
  PointAnnotationManager? _pointAnnotationManager;
  PolylineAnnotationManager? _polylineAnnotationManager;
  CircleAnnotationManager? _circleAnnotationManager;

  @override
  void didUpdateWidget(MapView oldWidget) {
    super.didUpdateWidget(oldWidget);

    // 選択されたコースが変わったらルートを再描画
    if (oldWidget.selectedCourseIndex != widget.selectedCourseIndex) {
      _drawCourseRoutes();
    }
  }

  @override
  Widget build(BuildContext context) {
    final locationState = ref.watch(locationProvider);
    final currentLocation = locationState.location;

    // Mapbox Access Tokenがない場合はプレースホルダー表示
    if (!EnvConstants.hasMapboxToken) {
      return _buildPlaceholder(
        'Mapbox Access Tokenが設定されていません',
        'MAPBOX_ACCESS_TOKEN環境変数を設定してください',
      );
    }

    // 位置情報取得中
    if (locationState.isLoading) {
      return _buildPlaceholder(
        '位置情報を取得中...',
        'しばらくお待ちください',
      );
    }

    // 位置情報がない場合
    if (currentLocation == null) {
      return _buildPlaceholder(
        '位置情報を取得できませんでした',
        locationState.error ?? 'デフォルト位置を使用しています',
      );
    }

    return MapWidget(
      key: ValueKey('map_${currentLocation.latitude}_${currentLocation.longitude}'),
      styleUri: MapboxStyles.MAPBOX_STREETS,
      cameraOptions: CameraOptions(
        center: Point(
          coordinates: Position(
            currentLocation.longitude,
            currentLocation.latitude,
          ),
        ),
        zoom: 14.0,
      ),
      onMapCreated: (MapboxMap mapboxMap) async {
        _mapboxMap = mapboxMap;

        // Annotation Managerを初期化
        _pointAnnotationManager = await mapboxMap.annotations.createPointAnnotationManager();
        _polylineAnnotationManager = await mapboxMap.annotations.createPolylineAnnotationManager();
        _circleAnnotationManager = await mapboxMap.annotations.createCircleAnnotationManager();

        // ユーザー位置マーカーを追加
        await _addUserLocationMarker(currentLocation.latitude, currentLocation.longitude);

        // 信号マーカーを追加
        await _addTrafficSignalMarkers();

        // コースルートを描画
        await _drawCourseRoutes();
      },
    );
  }

  /// ユーザー位置マーカーを追加（青い円）
  Future<void> _addUserLocationMarker(double lat, double lon) async {
    if (_circleAnnotationManager == null) return;

    final circleAnnotation = CircleAnnotationOptions(
      geometry: Point(coordinates: Position(lon, lat)),
      circleRadius: 10.0,
      circleColor: Colors.blue.toARGB32(),
      circleStrokeWidth: 3.0,
      circleStrokeColor: Colors.white.toARGB32(),
    );

    await _circleAnnotationManager!.create(circleAnnotation);
  }

  /// 信号マーカーを追加
  Future<void> _addTrafficSignalMarkers() async {
    if (_pointAnnotationManager == null) return;

    final trafficSignalState = ref.read(trafficSignalProvider);
    final signals = trafficSignalState.signals;

    if (signals.isEmpty) return;

    // 各信号にマーカーを追加
    final annotations = signals.map((signal) {
      return PointAnnotationOptions(
        geometry: Point(
          coordinates: Position(
            signal.location.longitude,
            signal.location.latitude,
          ),
        ),
        iconImage: 'traffic-signal-icon',
        iconSize: 0.5,
        iconColor: AppColors.trafficSignal.toARGB32(),
      );
    }).toList();

    await _pointAnnotationManager!.createMulti(annotations);
  }

  /// コースルートを描画
  Future<void> _drawCourseRoutes() async {
    if (_polylineAnnotationManager == null || widget.courses.isEmpty) return;

    // 既存のPolylineをクリア
    await _polylineAnnotationManager!.deleteAll();

    final selectedCourse = widget.courses[widget.selectedCourseIndex];

    // コースに座標データがない場合はスキップ
    if (selectedCourse.coordinates.isEmpty) return;

    // 座標をMapboxのPosition形式に変換
    final coordinates = selectedCourse.coordinates
        .map((latLng) => Position(latLng.longitude, latLng.latitude))
        .toList();

    // Polylineの色を決定
    final lineColor = _getRouteColor(selectedCourse.routeType);

    final polylineAnnotation = PolylineAnnotationOptions(
      geometry: LineString(coordinates: coordinates),
      lineColor: lineColor.toARGB32(),
      lineWidth: 4.0,
      lineOpacity: 0.8,
    );

    await _polylineAnnotationManager!.create(polylineAnnotation);
  }

  /// ルートタイプに応じた色を取得
  Color _getRouteColor(RouteType routeType) {
    switch (routeType) {
      case RouteType.park:
        return AppColors.greenRoute;
      case RouteType.greenway:
        return AppColors.park;
      case RouteType.flat:
        return AppColors.blueRoute;
      case RouteType.shortest:
        return AppColors.yellowRoute;
    }
  }

  /// プレースホルダーを表示
  Widget _buildPlaceholder(String title, String subtitle) {
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
              title,
              style: AppTypography.headline.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                subtitle,
                style: AppTypography.caption1,
                textAlign: TextAlign.center,
              ),
            ),
            if (widget.courses.isNotEmpty) ...[
              const SizedBox(height: 24),
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
                      widget.courses[widget.selectedCourseIndex].name,
                      style: AppTypography.subheadline.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
