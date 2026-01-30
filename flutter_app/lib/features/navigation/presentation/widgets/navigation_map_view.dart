import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:latlong2/latlong.dart' as latlong;
import '../../../course/domain/entities/course.dart';

/// ナビゲーション用地図ビュー
class NavigationMapView extends StatefulWidget {
  final Course course;
  final latlong.LatLng? currentLocation;
  final List<latlong.LatLng> traveledPath;

  const NavigationMapView({
    super.key,
    required this.course,
    this.currentLocation,
    this.traveledPath = const [],
  });

  @override
  State<NavigationMapView> createState() => _NavigationMapViewState();
}

class _NavigationMapViewState extends State<NavigationMapView> {
  MapboxMap? _mapboxMap;
  PointAnnotationManager? _pointAnnotationManager;
  PolylineAnnotationManager? _polylineAnnotationManager;
  CircleAnnotationManager? _circleAnnotationManager;

  @override
  Widget build(BuildContext context) {
    // デフォルトの中心座標（東京駅）
    final defaultCenter = Point(
      coordinates: Position(139.7673068, 35.6809591),
    );

    // 中心座標を決定
    Point center;
    if (widget.currentLocation != null) {
      center = Point(
        coordinates: Position(
          widget.currentLocation!.longitude,
          widget.currentLocation!.latitude,
        ),
      );
    } else if (widget.course.coordinates.isNotEmpty) {
      center = Point(
        coordinates: Position(
          widget.course.coordinates.first.longitude,
          widget.course.coordinates.first.latitude,
        ),
      );
    } else {
      center = defaultCenter;
    }

    return MapWidget(
      key: const ValueKey('navigation_map'),
      cameraOptions: CameraOptions(
        center: center,
        zoom: 15.0,
      ),
      styleUri: MapboxStyles.OUTDOORS,
      textureView: true,
      onMapCreated: (MapboxMap mapboxMap) {
        _mapboxMap = mapboxMap;
        _initializeAnnotations();
      },
    );
  }

  Future<void> _initializeAnnotations() async {
    if (_mapboxMap == null) return;

    // アノテーションマネージャーの初期化
    _pointAnnotationManager = await _mapboxMap!.annotations.createPointAnnotationManager();
    _polylineAnnotationManager = await _mapboxMap!.annotations.createPolylineAnnotationManager();
    _circleAnnotationManager = await _mapboxMap!.annotations.createCircleAnnotationManager();

    // コースルートを描画
    await _drawCourseRoute();

    // 現在地マーカーを追加
    if (widget.currentLocation != null) {
      await _updateCurrentLocationMarker();
    }

    // 走行軌跡を描画
    if (widget.traveledPath.isNotEmpty) {
      await _drawTraveledPath();
    }
  }

  /// コースルートを描画
  Future<void> _drawCourseRoute() async {
    if (_polylineAnnotationManager == null || widget.course.coordinates.isEmpty) return;

    final coordinates = widget.course.coordinates
        .map((coord) => Position(coord.longitude, coord.latitude))
        .toList();

    final lineString = LineString(coordinates: coordinates);

    final polylineAnnotation = PolylineAnnotationOptions(
      geometry: lineString,
      lineColor: Colors.blue.toARGB32(),
      lineWidth: 4.0,
      lineOpacity: 0.7,
    );

    await _polylineAnnotationManager!.create(polylineAnnotation);
  }

  /// 走行軌跡を描画
  Future<void> _drawTraveledPath() async {
    if (_polylineAnnotationManager == null || widget.traveledPath.isEmpty) return;

    final coordinates = widget.traveledPath
        .map((coord) => Position(coord.longitude, coord.latitude))
        .toList();

    final lineString = LineString(coordinates: coordinates);

    final polylineAnnotation = PolylineAnnotationOptions(
      geometry: lineString,
      lineColor: Colors.green.toARGB32(),
      lineWidth: 6.0,
      lineOpacity: 0.9,
    );

    await _polylineAnnotationManager!.create(polylineAnnotation);
  }

  /// 現在地マーカーを更新
  Future<void> _updateCurrentLocationMarker() async {
    if (_circleAnnotationManager == null || widget.currentLocation == null) return;

    // 既存のマーカーをクリア
    await _circleAnnotationManager!.deleteAll();

    final circleAnnotation = CircleAnnotationOptions(
      geometry: Point(
        coordinates: Position(
          widget.currentLocation!.longitude,
          widget.currentLocation!.latitude,
        ),
      ),
      circleRadius: 8.0,
      circleColor: Colors.blue.toARGB32(),
      circleStrokeWidth: 3.0,
      circleStrokeColor: Colors.white.toARGB32(),
    );

    await _circleAnnotationManager!.create(circleAnnotation);

    // カメラを現在地に移動
    _mapboxMap?.flyTo(
      CameraOptions(
        center: Point(
          coordinates: Position(
            widget.currentLocation!.longitude,
            widget.currentLocation!.latitude,
          ),
        ),
        zoom: 16.0,
      ),
      MapAnimationOptions(duration: 1000),
    );
  }

  @override
  void didUpdateWidget(NavigationMapView oldWidget) {
    super.didUpdateWidget(oldWidget);

    // 現在地が更新されたら再描画
    if (oldWidget.currentLocation != widget.currentLocation) {
      _updateCurrentLocationMarker();
    }

    // 走行軌跡が更新されたら再描画
    if (oldWidget.traveledPath.length != widget.traveledPath.length) {
      _polylineAnnotationManager?.deleteAll().then((_) {
        _drawCourseRoute();
        _drawTraveledPath();
      });
    }
  }
}
