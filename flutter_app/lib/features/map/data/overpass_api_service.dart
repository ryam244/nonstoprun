import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';
import '../../../core/constants/app_constants.dart';
import '../domain/traffic_signal.dart';
import '../domain/road_segment.dart';

/// Overpass API サービス
/// OpenStreetMapデータから信号機情報を取得
class OverpassApiService {
  final Dio _dio;

  static const String _baseUrl = 'https://overpass-api.de/api/interpreter';

  OverpassApiService({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              connectTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
              receiveTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
            ));

  /// 指定した位置の周辺の信号機を取得
  ///
  /// [center] 中心位置
  /// [radiusKm] 検索半径（キロメートル）
  Future<List<TrafficSignal>> getTrafficSignals({
    required LatLng center,
    double radiusKm = AppConstants.searchRadiusKm,
  }) async {
    try {
      // Overpass QL クエリ
      // highway=traffic_signals タグを持つノードを検索
      final query = _buildQuery(center, radiusKm);

      final response = await _dio.post(
        _baseUrl,
        data: query,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          headers: {
            'Accept': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return _parseResponse(response.data);
      } else {
        throw Exception('Failed to load traffic signals: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error fetching traffic signals: $e');
    }
  }

  /// Overpass QLクエリを構築
  String _buildQuery(LatLng center, double radiusKm) {
    final radiusMeters = (radiusKm * 1000).toInt();

    return '''
[out:json][timeout:25];
(
  node["highway"="traffic_signals"]
    (around:$radiusMeters,${center.latitude},${center.longitude});
);
out body;
''';
  }

  /// APIレスポンスをパース
  List<TrafficSignal> _parseResponse(dynamic data) {
    final List<TrafficSignal> signals = [];

    if (data is Map<String, dynamic> && data['elements'] is List) {
      final elements = data['elements'] as List;

      for (final element in elements) {
        if (element is Map<String, dynamic>) {
          try {
            signals.add(TrafficSignal.fromJson(element));
          } catch (e) {
            // パースエラーは無視して続行
            continue;
          }
        }
      }
    }

    return signals;
  }

  /// 矩形範囲内の信号機を取得
  ///
  /// [southwest] 南西の角
  /// [northeast] 北東の角
  Future<List<TrafficSignal>> getTrafficSignalsInBounds({
    required LatLng southwest,
    required LatLng northeast,
  }) async {
    try {
      final query = _buildBoundsQuery(southwest, northeast);

      final response = await _dio.post(
        _baseUrl,
        data: query,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          headers: {
            'Accept': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return _parseResponse(response.data);
      } else {
        throw Exception('Failed to load traffic signals: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error fetching traffic signals: $e');
    }
  }

  /// 矩形範囲用のOverpass QLクエリを構築
  String _buildBoundsQuery(LatLng southwest, LatLng northeast) {
    return '''
[out:json][timeout:25];
(
  node["highway"="traffic_signals"]
    (${southwest.latitude},${southwest.longitude},${northeast.latitude},${northeast.longitude});
);
out body;
''';
  }

  /// 道路データを取得
  Future<List<RoadSegment>> getRoadSegments({
    required LatLng center,
    double radiusKm = AppConstants.searchRadiusKm,
  }) async {
    try {
      final radiusMeters = (radiusKm * 1000).toInt();

      final query = '''
[out:json][timeout:30];
(
  way["highway"~"footway|path|cycleway|pedestrian|living_street|residential|tertiary|secondary|primary"]
    (around:$radiusMeters,${center.latitude},${center.longitude});
);
out geom;
''';

      final response = await _dio.post(
        _baseUrl,
        data: query,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          headers: {
            'Accept': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return _parseRoadSegments(response.data);
      } else {
        throw Exception('Failed to load road segments: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error fetching road segments: $e');
    }
  }

  /// 道路データをパース
  List<RoadSegment> _parseRoadSegments(dynamic data) {
    final List<RoadSegment> segments = [];

    if (data is Map<String, dynamic> && data['elements'] is List) {
      final elements = data['elements'] as List;

      for (final element in elements) {
        if (element is Map<String, dynamic>) {
          try {
            segments.add(RoadSegment.fromJson(element));
          } catch (e) {
            continue;
          }
        }
      }
    }

    return segments;
  }

  /// 公園データを取得
  Future<List<Park>> getParks({
    required LatLng center,
    double radiusKm = AppConstants.searchRadiusKm,
  }) async {
    try {
      final radiusMeters = (radiusKm * 1000).toInt();

      final query = '''
[out:json][timeout:30];
(
  way["leisure"="park"]
    (around:$radiusMeters,${center.latitude},${center.longitude});
  way["landuse"="recreation_ground"]
    (around:$radiusMeters,${center.latitude},${center.longitude});
);
out center geom;
''';

      final response = await _dio.post(
        _baseUrl,
        data: query,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          headers: {
            'Accept': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        return _parseParks(response.data);
      } else {
        throw Exception('Failed to load parks: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error fetching parks: $e');
    }
  }

  /// 公園データをパース
  List<Park> _parseParks(dynamic data) {
    final List<Park> parks = [];

    if (data is Map<String, dynamic> && data['elements'] is List) {
      final elements = data['elements'] as List;

      for (final element in elements) {
        if (element is Map<String, dynamic>) {
          try {
            parks.add(Park.fromJson(element));
          } catch (e) {
            continue;
          }
        }
      }
    }

    return parks;
  }
}
