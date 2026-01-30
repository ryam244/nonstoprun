import 'dart:math' as math;
import 'package:latlong2/latlong.dart';
import '../../../course/domain/entities/course.dart';

/// ナビゲーションサービス
/// ルート上の進捗計算、ルート逸脱検知などを行う
class NavigationService {
  static const double earthRadiusKm = 6371.0;
  static const double offRouteThresholdKm = 0.05; // 50m以上離れたらルート外と判定

  /// 2点間の距離を計算（km）
  double calculateDistance(LatLng from, LatLng to) {
    final lat1 = from.latitude * math.pi / 180;
    final lat2 = to.latitude * math.pi / 180;
    final dLat = (to.latitude - from.latitude) * math.pi / 180;
    final dLon = (to.longitude - from.longitude) * math.pi / 180;

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1) * math.cos(lat2) * math.sin(dLon / 2) * math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  /// ルート上の最も近い点を見つける
  /// 現在地からルート上の最も近い点のインデックスと距離を返す
  (int index, double distance) findNearestPointOnRoute(
    LatLng currentLocation,
    List<LatLng> routeCoordinates,
  ) {
    if (routeCoordinates.isEmpty) {
      return (0, double.infinity);
    }

    int nearestIndex = 0;
    double minDistance = double.infinity;

    for (int i = 0; i < routeCoordinates.length; i++) {
      final distance = calculateDistance(currentLocation, routeCoordinates[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return (nearestIndex, minDistance);
  }

  /// 現在地からルート上の最も近い点までの距離を計算
  double calculateDistanceToRoute(LatLng currentLocation, List<LatLng> routeCoordinates) {
    final (_, distance) = findNearestPointOnRoute(currentLocation, routeCoordinates);
    return distance;
  }

  /// ルートから外れているか判定
  bool isOffRoute(LatLng currentLocation, List<LatLng> routeCoordinates) {
    final distance = calculateDistanceToRoute(currentLocation, routeCoordinates);
    return distance > offRouteThresholdKm;
  }

  /// スタート地点からの走行距離を計算
  /// 現在地までルート上をたどった距離
  double calculateDistanceTraveled(
    LatLng currentLocation,
    List<LatLng> routeCoordinates,
  ) {
    if (routeCoordinates.isEmpty) return 0.0;

    final (nearestIndex, _) = findNearestPointOnRoute(currentLocation, routeCoordinates);

    double totalDistance = 0.0;
    for (int i = 0; i < nearestIndex && i < routeCoordinates.length - 1; i++) {
      totalDistance += calculateDistance(routeCoordinates[i], routeCoordinates[i + 1]);
    }

    return totalDistance;
  }

  /// 残り距離を計算
  double calculateDistanceRemaining(
    LatLng currentLocation,
    List<LatLng> routeCoordinates,
  ) {
    if (routeCoordinates.isEmpty) return 0.0;

    final (nearestIndex, _) = findNearestPointOnRoute(currentLocation, routeCoordinates);

    double remainingDistance = 0.0;
    for (int i = nearestIndex; i < routeCoordinates.length - 1; i++) {
      remainingDistance += calculateDistance(routeCoordinates[i], routeCoordinates[i + 1]);
    }

    return remainingDistance;
  }

  /// 実際に走った軌跡から距離を計算
  double calculateActualDistance(List<LatLng> traveledPath) {
    if (traveledPath.length < 2) return 0.0;

    double totalDistance = 0.0;
    for (int i = 0; i < traveledPath.length - 1; i++) {
      totalDistance += calculateDistance(traveledPath[i], traveledPath[i + 1]);
    }

    return totalDistance;
  }

  /// 現在のペースを計算（分/km）
  /// 最近の5分間のデータを使用
  double calculateCurrentPace({
    required List<LatLng> traveledPath,
    required Duration elapsedTime,
  }) {
    if (traveledPath.length < 2) return 0.0;

    final actualDistance = calculateActualDistance(traveledPath);
    if (actualDistance <= 0) return 0.0;

    final minutes = elapsedTime.inSeconds / 60.0;
    return minutes / actualDistance;
  }

  /// コース完了判定
  /// スタート地点の近く（50m以内）に戻り、80%以上の距離を走ったら完了
  bool isCompleted({
    required LatLng currentLocation,
    required Course course,
    required double distanceTraveled,
  }) {
    if (course.coordinates.isEmpty) return false;

    final startPoint = course.coordinates.first;
    final distanceToStart = calculateDistance(currentLocation, startPoint);

    // スタート地点から50m以内 かつ 目標距離の80%以上走行
    return distanceToStart < 0.05 && distanceTraveled >= course.distance * 0.8;
  }
}
