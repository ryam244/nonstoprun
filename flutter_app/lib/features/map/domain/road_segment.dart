import 'package:latlong2/latlong.dart';

/// 路面タイプ
enum SurfaceType {
  paved,      // 舗装路（アスファルト、コンクリート）
  unpaved,    // 未舗装路（土）
  gravel,     // 砂利
  grass,      // 芝生
  ground,     // 地面
  unknown,    // 不明
}

/// 道路セグメントを表すエンティティ
class RoadSegment {
  final String id;
  final List<LatLng> coordinates;
  final String? name;
  final String? highway; // primary, secondary, residential, path, etc.
  final Map<String, dynamic>? tags;

  RoadSegment({
    required this.id,
    required this.coordinates,
    this.name,
    this.highway,
    this.tags,
  });

  factory RoadSegment.fromJson(Map<String, dynamic> json) {
    final List<LatLng> coords = [];

    if (json['geometry'] is List) {
      for (final point in json['geometry']) {
        if (point is Map && point['lat'] != null && point['lon'] != null) {
          coords.add(LatLng(
            (point['lat'] as num).toDouble(),
            (point['lon'] as num).toDouble(),
          ));
        }
      }
    }

    return RoadSegment(
      id: json['id'].toString(),
      coordinates: coords,
      name: json['tags']?['name'] as String?,
      highway: json['tags']?['highway'] as String?,
      tags: json['tags'] as Map<String, dynamic>?,
    );
  }

  /// 道路の長さを計算（km）
  double get lengthKm {
    if (coordinates.length < 2) return 0;

    double total = 0;
    for (int i = 0; i < coordinates.length - 1; i++) {
      total += _distance(coordinates[i], coordinates[i + 1]);
    }
    return total;
  }

  double _distance(LatLng from, LatLng to) {
    const Distance distance = Distance();
    return distance(from, to) / 1000; // メートルからキロメートルに変換
  }

  /// 歩行・ランニング可能な道路かどうか
  bool get isWalkable {
    if (highway == null) return false;
    return [
      'footway',
      'path',
      'cycleway',
      'pedestrian',
      'living_street',
      'residential',
      'tertiary',
      'secondary',
      'primary',
    ].contains(highway);
  }

  /// 公園内の道路かどうか
  bool get isParkPath {
    return highway == 'footway' || highway == 'path' || highway == 'cycleway';
  }

  /// 路面タイプを取得
  SurfaceType get surfaceType {
    final surface = tags?['surface'] as String?;
    if (surface == null) {
      // surfaceタグがない場合はhighwayタイプから推定
      if (highway == 'path' || highway == 'footway') {
        return SurfaceType.unpaved;
      }
      return SurfaceType.paved; // デフォルトは舗装路
    }

    // OSMのsurfaceタグを分類
    switch (surface.toLowerCase()) {
      case 'paved':
      case 'asphalt':
      case 'concrete':
        return SurfaceType.paved;
      case 'unpaved':
      case 'compacted':
      case 'dirt':
      case 'earth':
        return SurfaceType.unpaved;
      case 'gravel':
      case 'pebblestone':
      case 'fine_gravel':
        return SurfaceType.gravel;
      case 'grass':
      case 'grass_paver':
        return SurfaceType.grass;
      case 'ground':
      case 'sand':
        return SurfaceType.ground;
      default:
        return SurfaceType.unknown;
    }
  }
}

/// 公園を表すエンティティ
class Park {
  final String id;
  final String? name;
  final LatLng center;
  final List<LatLng>? boundary;
  final Map<String, dynamic>? tags;

  Park({
    required this.id,
    this.name,
    required this.center,
    this.boundary,
    this.tags,
  });

  factory Park.fromJson(Map<String, dynamic> json) {
    LatLng center;

    if (json['center'] != null) {
      center = LatLng(
        (json['center']['lat'] as num).toDouble(),
        (json['center']['lon'] as num).toDouble(),
      );
    } else if (json['lat'] != null && json['lon'] != null) {
      center = LatLng(
        (json['lat'] as num).toDouble(),
        (json['lon'] as num).toDouble(),
      );
    } else {
      center = const LatLng(0, 0);
    }

    List<LatLng>? boundary;
    if (json['geometry'] is List) {
      boundary = [];
      for (final point in json['geometry']) {
        if (point is Map && point['lat'] != null && point['lon'] != null) {
          boundary.add(LatLng(
            (point['lat'] as num).toDouble(),
            (point['lon'] as num).toDouble(),
          ));
        }
      }
    }

    return Park(
      id: json['id'].toString(),
      name: json['tags']?['name'] as String?,
      center: center,
      boundary: boundary,
      tags: json['tags'] as Map<String, dynamic>?,
    );
  }
}
