import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/constants/env_constants.dart';
import '../../../../core/providers/location_provider.dart';
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
      onMapCreated: (MapboxMap mapboxMap) {
        _mapboxMap = mapboxMap;
        _addUserLocationMarker(currentLocation.latitude, currentLocation.longitude);
        _drawCourseRoutes();
      },
    );
  }

  /// ユーザー位置マーカーを追加
  Future<void> _addUserLocationMarker(double lat, double lon) async {
    if (_mapboxMap == null) return;

    // TODO: カスタムマーカーを追加
    // 現在はデフォルトの中心点として表示
  }

  /// コースルートを描画
  Future<void> _drawCourseRoutes() async {
    if (_mapboxMap == null || widget.courses.isEmpty) return;

    // TODO: 選択されたコースのルートを地図上に描画
    // Polylineを使用してルートを表示
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
