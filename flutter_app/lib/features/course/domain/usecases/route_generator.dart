import 'dart:math' as math;
import 'package:latlong2/latlong.dart';
import '../../../map/domain/traffic_signal.dart';
import '../../../map/domain/road_segment.dart';
import '../entities/course.dart';

/// ルート生成サービス
///
/// 実際の道路ネットワークと信号データを使用して周回コースを生成します
class RouteGenerator {
  static const double earthRadiusKm = 6371.0;

  /// 周回コースを生成
  ///
  /// [center] スタート地点
  /// [distanceKm] 希望距離（km）
  /// [signals] 信号データ
  /// [roads] 道路データ
  /// [parks] 公園データ
  List<Course> generateRoutes({
    required LatLng center,
    required double distanceKm,
    required List<TrafficSignal> signals,
    List<RoadSegment>? roads,
    List<Park>? parks,
  }) {
    final routes = <Course>[];

    // 道路データがある場合は道路ベースのルート生成
    if (roads != null && roads.isNotEmpty) {
      routes.addAll(_generateRoadBasedRoutes(
        center: center,
        distanceKm: distanceKm,
        signals: signals,
        roads: roads,
        parks: parks ?? [],
      ));
    } else {
      // 道路データがない場合は円形ルートにフォールバック
      routes.addAll(_generateCircularRoutes(
        center: center,
        distanceKm: distanceKm,
        signals: signals,
      ));
    }

    return routes;
  }

  /// 道路ベースのルート生成
  List<Course> _generateRoadBasedRoutes({
    required LatLng center,
    required double distanceKm,
    required List<TrafficSignal> signals,
    required List<RoadSegment> roads,
    required List<Park> parks,
  }) {
    final routes = <Course>[];

    // 歩行可能な道路のみを抽出
    final walkableRoads = roads.where((r) => r.isWalkable && r.coordinates.isNotEmpty).toList();

    if (walkableRoads.isEmpty) {
      return _generateCircularRoutes(center: center, distanceKm: distanceKm, signals: signals);
    }

    // コース1: 公園・緑道優先（信号回避）
    routes.add(_generateParkPriorityRoute(
      center: center,
      distanceKm: distanceKm,
      roads: walkableRoads,
      signals: signals,
      parks: parks,
    ));

    // コース2: 信号回避優先
    routes.add(_generateSignalAvoidanceRoute(
      center: center,
      distanceKm: distanceKm,
      roads: walkableRoads,
      signals: signals,
      parks: parks,
    ));

    // コース3: 最短距離優先
    routes.add(_generateShortestRoute(
      center: center,
      distanceKm: distanceKm,
      roads: walkableRoads,
      signals: signals,
      parks: parks,
    ));

    return routes;
  }

  /// 公園・緑道優先ルート
  Course _generateParkPriorityRoute({
    required LatLng center,
    required double distanceKm,
    required List<RoadSegment> roads,
    required List<TrafficSignal> signals,
    required List<Park> parks,
  }) {
    // 公園内の道路を優先
    final parkRoads = roads.where((r) => r.isParkPath).toList();
    final otherRoads = roads.where((r) => !r.isParkPath).toList();

    final routeData = _buildRouteWithRoads(
      center: center,
      targetDistanceKm: distanceKm,
      preferredRoads: parkRoads,
      fallbackRoads: otherRoads,
      avoidSignals: true,
      signals: signals,
    );

    final coordinates = routeData['coordinates'] as List<LatLng>;
    final usedRoads = routeData['usedRoads'] as List<RoadSegment>;

    final signalCount = _countSignalsNearRoute(coordinates, signals);
    final greenRatio = _calculateGreenRatio(coordinates, parks);
    final surfaceRatios = _calculateSurfaceRatios(usedRoads);

    return Course(
      id: 'park-route',
      name: '信号$signalCount回！公園メインの快適${distanceKm.toStringAsFixed(1)}km',
      distance: _calculateRouteDistance(coordinates),
      signalCount: signalCount,
      greenRatio: greenRatio,
      elevationGain: 15, // TODO: 実際の標高データから計算
      routeType: RouteType.park,
      coordinates: coordinates,
      surfaceRatios: surfaceRatios,
    );
  }

  /// 信号回避優先ルート
  Course _generateSignalAvoidanceRoute({
    required LatLng center,
    required double distanceKm,
    required List<RoadSegment> roads,
    required List<TrafficSignal> signals,
    required List<Park> parks,
  }) {
    final routeData = _buildRouteWithRoads(
      center: center,
      targetDistanceKm: distanceKm,
      preferredRoads: roads,
      fallbackRoads: [],
      avoidSignals: true,
      signals: signals,
    );

    final coordinates = routeData['coordinates'] as List<LatLng>;
    final usedRoads = routeData['usedRoads'] as List<RoadSegment>;

    final signalCount = _countSignalsNearRoute(coordinates, signals);
    final greenRatio = _calculateGreenRatio(coordinates, parks);
    final surfaceRatios = _calculateSurfaceRatios(usedRoads);

    return Course(
      id: 'greenway-route',
      name: '緑道中心！快適な${distanceKm.toStringAsFixed(1)}km',
      distance: _calculateRouteDistance(coordinates),
      signalCount: signalCount,
      greenRatio: greenRatio,
      elevationGain: 25,
      routeType: RouteType.greenway,
      coordinates: coordinates,
      surfaceRatios: surfaceRatios,
    );
  }

  /// 最短距離優先ルート
  Course _generateShortestRoute({
    required LatLng center,
    required double distanceKm,
    required List<RoadSegment> roads,
    required List<TrafficSignal> signals,
    required List<Park> parks,
  }) {
    final routeData = _buildRouteWithRoads(
      center: center,
      targetDistanceKm: distanceKm,
      preferredRoads: roads,
      fallbackRoads: [],
      avoidSignals: false,
      signals: signals,
    );

    final coordinates = routeData['coordinates'] as List<LatLng>;
    final usedRoads = routeData['usedRoads'] as List<RoadSegment>;

    final signalCount = _countSignalsNearRoute(coordinates, signals);
    final greenRatio = _calculateGreenRatio(coordinates, parks);
    final surfaceRatios = _calculateSurfaceRatios(usedRoads);

    return Course(
      id: 'flat-route',
      name: '完全フラットな${distanceKm.toStringAsFixed(1)}km',
      distance: _calculateRouteDistance(coordinates),
      signalCount: signalCount,
      greenRatio: greenRatio,
      elevationGain: 5,
      routeType: RouteType.flat,
      coordinates: coordinates,
      surfaceRatios: surfaceRatios,
    );
  }

  /// ルートを構築（道路情報も返す）
  Map<String, dynamic> _buildRouteWithRoads({
    required LatLng center,
    required double targetDistanceKm,
    required List<RoadSegment> preferredRoads,
    required List<RoadSegment> fallbackRoads,
    required bool avoidSignals,
    required List<TrafficSignal> signals,
  }) {
    final coordinates = <LatLng>[];
    final usedRoads = <RoadSegment>[];
    double accumulatedDistance = 0;
    LatLng currentPosition = center;

    // スタート地点を追加
    coordinates.add(center);

    // 最も近い道路を見つける
    final availableRoads = [...preferredRoads, ...fallbackRoads];
    final usedRoadIds = <String>{};
    int maxIterations = 100;
    int iterations = 0;

    while (accumulatedDistance < targetDistanceKm && iterations < maxIterations) {
      iterations++;

      // 現在地から最も近い未使用の道路を見つける
      RoadSegment? nextRoad;
      double minDistance = double.infinity;

      for (final road in availableRoads) {
        if (usedRoadIds.contains(road.id)) continue;

        // この道路の最初のポイントまでの距離
        final distToStart = _calculateDistance(currentPosition, road.coordinates.first);

        // 信号回避モードの場合、信号が近い道路は避ける
        if (avoidSignals && _hasNearbySignals(road.coordinates, signals, 0.05)) {
          continue;
        }

        if (distToStart < minDistance) {
          minDistance = distToStart;
          nextRoad = road;
        }
      }

      if (nextRoad == null) break;

      // 道路の座標を追加
      coordinates.addAll(nextRoad.coordinates);
      accumulatedDistance += nextRoad.lengthKm;
      currentPosition = nextRoad.coordinates.last;
      usedRoadIds.add(nextRoad.id);
      usedRoads.add(nextRoad);

      // 目標距離の120%を超えたら終了
      if (accumulatedDistance > targetDistanceKm * 1.2) break;
    }

    // スタート地点に戻る
    if (coordinates.isNotEmpty && coordinates.last != center) {
      coordinates.add(center);
    }

    return {
      'coordinates': coordinates,
      'usedRoads': usedRoads,
    };
  }

  /// 道路に近くの信号があるかチェック
  bool _hasNearbySignals(List<LatLng> coordinates, List<TrafficSignal> signals, double thresholdKm) {
    for (final coord in coordinates) {
      for (final signal in signals) {
        if (_calculateDistance(coord, signal.location) < thresholdKm) {
          return true;
        }
      }
    }
    return false;
  }

  /// 緑地率を計算
  int _calculateGreenRatio(List<LatLng> coordinates, List<Park> parks) {
    if (coordinates.isEmpty || parks.isEmpty) return 0;

    int pointsNearParks = 0;
    const nearParkThresholdKm = 0.1; // 100m以内

    for (final coord in coordinates) {
      for (final park in parks) {
        if (_calculateDistance(coord, park.center) < nearParkThresholdKm) {
          pointsNearParks++;
          break;
        }
      }
    }

    return ((pointsNearParks / coordinates.length) * 100).round();
  }

  /// ルートの実際の距離を計算
  double _calculateRouteDistance(List<LatLng> coordinates) {
    if (coordinates.length < 2) return 0;

    double total = 0;
    for (int i = 0; i < coordinates.length - 1; i++) {
      total += _calculateDistance(coordinates[i], coordinates[i + 1]);
    }
    return total;
  }

  /// 円形ルート生成（フォールバック）
  List<Course> _generateCircularRoutes({
    required LatLng center,
    required double distanceKm,
    required List<TrafficSignal> signals,
  }) {
    final routes = <Course>[];

    // コース1: 公園優先
    routes.add(_generateCircularCourse(
      center: center,
      distanceKm: distanceKm,
      signals: signals,
      routeType: RouteType.park,
      points: 16,
      offset: 0,
      avoidSignals: true,
    ));

    // コース2: 緑道優先
    routes.add(_generateCircularCourse(
      center: center,
      distanceKm: distanceKm,
      signals: signals,
      routeType: RouteType.greenway,
      points: 20,
      offset: math.pi / 6,
      avoidSignals: true,
    ));

    // コース3: フラット
    routes.add(_generateCircularCourse(
      center: center,
      distanceKm: distanceKm,
      signals: signals,
      routeType: RouteType.flat,
      points: 12,
      offset: -math.pi / 4,
      avoidSignals: false,
    ));

    return routes;
  }

  /// 円形コースを生成
  Course _generateCircularCourse({
    required LatLng center,
    required double distanceKm,
    required List<TrafficSignal> signals,
    required RouteType routeType,
    required int points,
    required double offset,
    required bool avoidSignals,
  }) {
    final radiusKm = distanceKm / (2 * math.pi);
    final coordinates = <LatLng>[];

    for (int i = 0; i <= points; i++) {
      final angle = (2 * math.pi * i / points) + offset;
      final metersPerDegree = 111320.0;

      final lat = center.latitude + (radiusKm / metersPerDegree * 1000) * math.cos(angle);
      final lon = center.longitude +
          (radiusKm / metersPerDegree * 1000) * math.sin(angle) /
              math.cos(center.latitude * math.pi / 180);

      var point = LatLng(lat, lon);

      // 信号を避ける
      if (avoidSignals && signals.isNotEmpty) {
        point = _avoidNearbySignals(point, signals, radiusKm);
      }

      coordinates.add(point);
    }

    final signalCount = _countSignalsNearRoute(coordinates, signals);

    return Course(
      id: '${routeType.name}-route',
      name: _getCourseName(routeType, distanceKm, signalCount),
      distance: distanceKm,
      signalCount: signalCount,
      greenRatio: _getDefaultGreenRatio(routeType),
      elevationGain: _getDefaultElevationGain(routeType),
      routeType: routeType,
      coordinates: coordinates,
    );
  }

  /// デフォルトの緑地率を取得
  int _getDefaultGreenRatio(RouteType type) {
    switch (type) {
      case RouteType.park:
        return 90;
      case RouteType.greenway:
        return 80;
      case RouteType.flat:
        return 40;
      case RouteType.shortest:
        return 30;
    }
  }

  /// デフォルトの累積標高を取得
  int _getDefaultElevationGain(RouteType type) {
    switch (type) {
      case RouteType.park:
        return 15;
      case RouteType.greenway:
        return 25;
      case RouteType.flat:
        return 5;
      case RouteType.shortest:
        return 20;
    }
  }

  /// コース名を取得
  String _getCourseName(RouteType type, double distanceKm, int signalCount) {
    switch (type) {
      case RouteType.park:
        return '信号$signalCount回！公園メインの快適${distanceKm.toStringAsFixed(1)}km';
      case RouteType.greenway:
        return '緑道80%！木陰が気持ちいい${distanceKm.toStringAsFixed(1)}km';
      case RouteType.flat:
        return '完全フラットな${distanceKm.toStringAsFixed(1)}km';
      case RouteType.shortest:
        return '最短距離の${distanceKm.toStringAsFixed(1)}km';
    }
  }

  /// 近くの信号を避ける
  LatLng _avoidNearbySignals(LatLng point, List<TrafficSignal> signals, double radiusKm) {
    const avoidanceDistanceKm = 0.05;

    for (final signal in signals) {
      final distance = _calculateDistance(point, signal.location);

      if (distance < avoidanceDistanceKm) {
        final angle = math.atan2(
          point.longitude - signal.location.longitude,
          point.latitude - signal.location.latitude,
        );

        const metersPerDegree = 111320.0;
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

    const thresholdKm = 0.03;
    int count = 0;

    for (final signal in signals) {
      for (final coord in coordinates) {
        final distance = _calculateDistance(coord, signal.location);
        if (distance < thresholdKm) {
          count++;
          break;
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

  /// 路面タイプの割合を計算
  Map<SurfaceType, int> _calculateSurfaceRatios(List<RoadSegment> roads) {
    if (roads.isEmpty) return {};

    // 各路面タイプの総距離を計算
    final surfaceDistances = <SurfaceType, double>{};
    double totalDistance = 0;

    for (final road in roads) {
      final surfaceType = road.surfaceType;
      final distance = road.lengthKm;

      surfaceDistances[surfaceType] = (surfaceDistances[surfaceType] ?? 0) + distance;
      totalDistance += distance;
    }

    if (totalDistance == 0) return {};

    // 割合を計算（%）
    final ratios = <SurfaceType, int>{};
    for (final entry in surfaceDistances.entries) {
      final percentage = ((entry.value / totalDistance) * 100).round();
      if (percentage > 0) { // 0%は除外
        ratios[entry.key] = percentage;
      }
    }

    return ratios;
  }
}
