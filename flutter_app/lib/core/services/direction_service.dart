import 'dart:math' as math;
import 'package:latlong2/latlong.dart';

/// 方向計算サービス
class DirectionService {
  /// 2点間の方位角を計算（度数法、北を0度、時計回り）
  double calculateBearing(LatLng from, LatLng to) {
    final lat1 = from.latitude * math.pi / 180;
    final lat2 = to.latitude * math.pi / 180;
    final dLon = (to.longitude - from.longitude) * math.pi / 180;

    final y = math.sin(dLon) * math.cos(lat2);
    final x = math.cos(lat1) * math.sin(lat2) -
        math.sin(lat1) * math.cos(lat2) * math.cos(dLon);

    final bearing = math.atan2(y, x);

    // ラジアンから度に変換し、0-360の範囲に正規化
    return (bearing * 180 / math.pi + 360) % 360;
  }

  /// 次のウェイポイントを見つける
  /// 現在地から指定距離以内で最も近いポイントより先のポイントを返す
  LatLng? findNextWaypoint(
    LatLng currentLocation,
    List<LatLng> route, {
    double lookAheadDistanceKm = 0.05, // 50m先を見る
  }) {
    if (route.isEmpty) return null;

    // 現在地から最も近いルート上のポイントを見つける
    int closestIndex = 0;
    double minDistance = double.infinity;

    for (int i = 0; i < route.length; i++) {
      final distance = _calculateDistance(currentLocation, route[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // 最も近いポイントから先のポイントで、lookAheadDistance先のポイントを探す
    double accumulatedDistance = 0;
    for (int i = closestIndex + 1; i < route.length; i++) {
      accumulatedDistance += _calculateDistance(route[i - 1], route[i]);

      if (accumulatedDistance >= lookAheadDistanceKm) {
        return route[i];
      }
    }

    // lookAheadDistance先がない場合は、残りのルートの最後のポイント
    if (closestIndex + 1 < route.length) {
      return route[closestIndex + 1];
    }

    return null;
  }

  /// 方位角から方向テキストを取得
  String getDirectionText(double bearing) {
    if (bearing >= 337.5 || bearing < 22.5) {
      return '直進';
    } else if (bearing >= 22.5 && bearing < 67.5) {
      return '右斜め前';
    } else if (bearing >= 67.5 && bearing < 112.5) {
      return '右折';
    } else if (bearing >= 112.5 && bearing < 157.5) {
      return '右斜め後ろ';
    } else if (bearing >= 157.5 && bearing < 202.5) {
      return 'Uターン';
    } else if (bearing >= 202.5 && bearing < 247.5) {
      return '左斜め後ろ';
    } else if (bearing >= 247.5 && bearing < 292.5) {
      return '左折';
    } else {
      return '左斜め前';
    }
  }

  /// 方位角からアイコンを取得
  DirectionIcon getDirectionIcon(double bearing) {
    if (bearing >= 337.5 || bearing < 22.5) {
      return DirectionIcon.straight;
    } else if (bearing >= 22.5 && bearing < 67.5) {
      return DirectionIcon.slightRight;
    } else if (bearing >= 67.5 && bearing < 112.5) {
      return DirectionIcon.right;
    } else if (bearing >= 112.5 && bearing < 157.5) {
      return DirectionIcon.sharpRight;
    } else if (bearing >= 157.5 && bearing < 202.5) {
      return DirectionIcon.uTurn;
    } else if (bearing >= 202.5 && bearing < 247.5) {
      return DirectionIcon.sharpLeft;
    } else if (bearing >= 247.5 && bearing < 292.5) {
      return DirectionIcon.left;
    } else {
      return DirectionIcon.slightLeft;
    }
  }

  /// 2点間の距離を計算（km）
  double _calculateDistance(LatLng from, LatLng to) {
    const earthRadiusKm = 6371.0;
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

/// 方向アイコンの種類
enum DirectionIcon {
  straight,
  slightRight,
  right,
  sharpRight,
  uTurn,
  sharpLeft,
  left,
  slightLeft,
}
