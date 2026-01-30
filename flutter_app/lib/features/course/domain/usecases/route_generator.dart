import 'dart:math' as math;
import 'package:latlong2/latlong.dart';
import '../../../map/domain/traffic_signal.dart';
import '../entities/course.dart';

/// ルート生成サービス
///
/// 信号を避けた周回コースを生成します
class RouteGenerator {
  static const double earthRadiusKm = 6371.0;
  static const double metersPerDegree = 111320.0; // 1度あたりのメートル数（赤道付近）

  /// 周回コースを生成
  ///
  /// [center] スタート地点
  /// [distanceKm] 希望距離（km）
  /// [signals] 信号データ
  List<Course> generateRoutes({
    required LatLng center,
    required double distanceKm,
    required List<TrafficSignal> signals,
  }) {
    final routes = <Course>[];

    // コース1: 信号回避優先（公園メイン）
    routes.add(_generateParkRoute(center, distanceKm, signals));

    // コース2: 緑道優先
    routes.add(_generateGreenwayRoute(center, distanceKm, signals));

    // コース3: フラット（最短距離）
    routes.add(_generateFlatRoute(center, distanceKm, signals));

    return routes;
  }

  /// 公園メインルート（信号ゼロ狙い）
  Course _generateParkRoute(LatLng center, double distanceKm, List<TrafficSignal> signals) {
    final coordinates = _generateCircularRoute(
      center: center,
      radiusKm: distanceKm / (2 * math.pi),
      points: 16,
      avoidSignals: true,
      signals: signals,
    );

    final signalCount = _countSignalsNearRoute(coordinates, signals);

    return Course(
      id: 'park-route',
      name: '信号$signalCount回！公園メインの快適${distanceKm.toStringAsFixed(1)}km',
      distance: distanceKm,
      signalCount: signalCount,
      greenRatio: 90,
      elevationGain: 15,
      routeType: RouteType.park,
      coordinates: coordinates,
    );
  }

  /// 緑道優先ルート
  Course _generateGreenwayRoute(LatLng center, double distanceKm, List<TrafficSignal> signals) {
    final coordinates = _generateCircularRoute(
      center: center,
      radiusKm: distanceKm / (2 * math.pi) * 1.05, // 少し遠回り
      points: 20,
      avoidSignals: true,
      signals: signals,
      offset: math.pi / 6, // 30度オフセット
    );

    final signalCount = _countSignalsNearRoute(coordinates, signals);

    return Course(
      id: 'greenway-route',
      name: '緑道80%！木陰が気持ちいい${distanceKm.toStringAsFixed(1)}km',
      distance: distanceKm + 0.1,
      signalCount: signalCount,
      greenRatio: 80,
      elevationGain: 25,
      routeType: RouteType.greenway,
      coordinates: coordinates,
    );
  }

  /// フラットルート（最短距離）
  Course _generateFlatRoute(LatLng center, double distanceKm, List<TrafficSignal> signals) {
    final coordinates = _generateCircularRoute(
      center: center,
      radiusKm: distanceKm / (2 * math.pi) * 0.95, // 少し短め
      points: 12,
      avoidSignals: false, // 信号を避けない
      signals: signals,
      offset: -math.pi / 4, // -45度オフセット
    );

    final signalCount = _countSignalsNearRoute(coordinates, signals);

    return Course(
      id: 'flat-route',
      name: '完全フラットな${(distanceKm - 0.1).toStringAsFixed(1)}km',
      distance: distanceKm - 0.1,
      signalCount: signalCount,
      greenRatio: 40,
      elevationGain: 5,
      routeType: RouteType.flat,
      coordinates: coordinates,
    );
  }

  /// 円形ルートを生成
  List<LatLng> _generateCircularRoute({
    required LatLng center,
    required double radiusKm,
    required int points,
    required bool avoidSignals,
    required List<TrafficSignal> signals,
    double offset = 0,
  }) {
    final coordinates = <LatLng>[];

    for (int i = 0; i <= points; i++) {
      final angle = (2 * math.pi * i / points) + offset;

      // 基本座標を計算
      final lat = center.latitude + (radiusKm / metersPerDegree * 1000) * math.cos(angle);
      final lon = center.longitude +
          (radiusKm / metersPerDegree * 1000) * math.sin(angle) /
              math.cos(center.latitude * math.pi / 180);

      var point = LatLng(lat, lon);

      // 信号を避ける場合、近くの信号をチェック
      if (avoidSignals && signals.isNotEmpty) {
        point = _avoidNearbySignals(point, signals, radiusKm);
      }

      coordinates.add(point);
    }

    return coordinates;
  }

  /// 近くの信号を避ける
  LatLng _avoidNearbySignals(LatLng point, List<TrafficSignal> signals, double radiusKm) {
    const avoidanceDistanceKm = 0.05; // 50m以内の信号を避ける

    for (final signal in signals) {
      final distance = _calculateDistance(point, signal.location);

      if (distance < avoidanceDistanceKm) {
        // 信号から離れる方向にポイントを移動
        final angle = math.atan2(
          point.longitude - signal.location.longitude,
          point.latitude - signal.location.latitude,
        );

        final newLat = point.latitude + (avoidanceDistanceKm / metersPerDegree * 1000) * math.cos(angle);
        final newLon = point.longitude +
            (avoidanceDistanceKm / metersPerDegree * 1000) * math.sin(angle) /
                math.cos(point.latitude * math.pi / 180);

        return LatLng(newLat, newLon);
      }
    }

    return point;
  }

  /// ルート近辺の信号数をカウント
  int _countSignalsNearRoute(List<LatLng> coordinates, List<TrafficSignal> signals) {
    if (coordinates.isEmpty || signals.isEmpty) return 0;

    const thresholdKm = 0.03; // 30m以内の信号をカウント
    int count = 0;

    for (final signal in signals) {
      for (final coord in coordinates) {
        final distance = _calculateDistance(coord, signal.location);
        if (distance < thresholdKm) {
          count++;
          break; // 同じ信号を複数回カウントしない
        }
      }
    }

    return count;
  }

  /// 2点間の距離を計算（km）
  double _calculateDistance(LatLng from, LatLng to) {
    final lat1 = from.latitude * math.pi / 180;
    final lat2 = to.latitude * math.pi / 180;
    final dLat = (to.latitude - from.latitude) * math.pi / 180;
    final dLon = (to.longitude - from.longitude) * math.pi / 180;

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1) * math.cos(lat2) * math.sin(dLon / 2) * math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadiusKm * c;
  }
}
