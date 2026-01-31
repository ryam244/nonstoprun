import 'package:latlong2/latlong.dart';
import '../../../map/domain/road_segment.dart';

/// ルートの種類
enum RouteType {
  park, // 公園メイン
  greenway, // 緑道メイン
  flat, // フラット（高低差少ない）
  shortest, // 最短距離
}

/// コース情報を表すエンティティ
class Course {
  final String id;
  final String name;
  final double distance; // km
  final int signalCount; // 信号の数
  final int greenRatio; // 緑地率(%)
  final int elevationGain; // 累積標高(m)
  final RouteType routeType;
  final List<LatLng> coordinates;
  final List<double>? elevations; // 標高データ(m)
  final Map<SurfaceType, int>? surfaceRatios; // 路面タイプ割合(%)
  final String? description;

  Course({
    required this.id,
    required this.name,
    required this.distance,
    required this.signalCount,
    required this.greenRatio,
    required this.elevationGain,
    required this.routeType,
    required this.coordinates,
    this.elevations,
    this.surfaceRatios,
    this.description,
  });

  /// ルートタイプの表示名
  String get routeTypeName {
    switch (routeType) {
      case RouteType.park:
        return '公園優先';
      case RouteType.greenway:
        return '緑道優先';
      case RouteType.flat:
        return 'フラット';
      case RouteType.shortest:
        return '最短距離';
    }
  }

  /// ルートタイプのアイコン
  String get routeTypeIcon {
    switch (routeType) {
      case RouteType.park:
        return '🌳';
      case RouteType.greenway:
        return '🌿';
      case RouteType.flat:
        return '📏';
      case RouteType.shortest:
        return '⚡';
    }
  }

  /// 推定所要時間（分）
  /// ペース: 6分/kmで計算
  int get estimatedDuration {
    return (distance * 6).round();
  }

  Course copyWith({
    String? id,
    String? name,
    double? distance,
    int? signalCount,
    int? greenRatio,
    int? elevationGain,
    RouteType? routeType,
    List<LatLng>? coordinates,
    List<double>? elevations,
    Map<SurfaceType, int>? surfaceRatios,
    String? description,
  }) {
    return Course(
      id: id ?? this.id,
      name: name ?? this.name,
      distance: distance ?? this.distance,
      signalCount: signalCount ?? this.signalCount,
      greenRatio: greenRatio ?? this.greenRatio,
      elevationGain: elevationGain ?? this.elevationGain,
      routeType: routeType ?? this.routeType,
      coordinates: coordinates ?? this.coordinates,
      elevations: elevations ?? this.elevations,
      surfaceRatios: surfaceRatios ?? this.surfaceRatios,
      description: description ?? this.description,
    );
  }
}
