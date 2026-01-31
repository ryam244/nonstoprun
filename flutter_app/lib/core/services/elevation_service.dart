import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter/foundation.dart';

/// 標高データ取得サービス
///
/// Open Elevation APIを使用して標高データを取得します
class ElevationService {
  final Dio _dio = Dio();
  static const String _baseUrl = 'https://api.open-elevation.com/api/v1';

  /// 座標リストの標高データを取得
  ///
  /// [coordinates] 標高を取得する座標のリスト
  /// 戻り値: 各座標の標高（メートル）のリスト
  Future<List<double>> getElevations(List<LatLng> coordinates) async {
    if (coordinates.isEmpty) return [];

    try {
      // APIのリクエスト制限を考慮して、座標数を制限（最大100ポイント）
      final limitedCoordinates = coordinates.length > 100
          ? _sampleCoordinates(coordinates, 100)
          : coordinates;

      // リクエストボディを作成
      final locations = limitedCoordinates
          .map((coord) => {
                'latitude': coord.latitude,
                'longitude': coord.longitude,
              })
          .toList();

      // POSTリクエストで標高データを取得
      final response = await _dio.post(
        '$_baseUrl/lookup',
        data: {'locations': locations},
        options: Options(
          headers: {'Content-Type': 'application/json'},
          sendTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final results = data['results'] as List;

        return results.map<double>((result) {
          return (result['elevation'] as num).toDouble();
        }).toList();
      }

      return List.filled(limitedCoordinates.length, 0.0);
    } on DioException catch (e) {
      debugPrint('Elevation API error: ${e.message}');
      // エラー時は標高0として返す
      return List.filled(coordinates.length > 100 ? 100 : coordinates.length, 0.0);
    } catch (e) {
      debugPrint('Unexpected error in getElevations: $e');
      return List.filled(coordinates.length > 100 ? 100 : coordinates.length, 0.0);
    }
  }

  /// 座標リストをサンプリング
  ///
  /// 大量の座標から均等にサンプルを取得
  List<LatLng> _sampleCoordinates(List<LatLng> coordinates, int maxCount) {
    if (coordinates.length <= maxCount) return coordinates;

    final step = coordinates.length / maxCount;
    final sampled = <LatLng>[];

    for (int i = 0; i < maxCount; i++) {
      final index = (i * step).floor();
      sampled.add(coordinates[index]);
    }

    return sampled;
  }

  /// 累積標高（上り）を計算
  ///
  /// [elevations] 標高データのリスト
  /// 戻り値: 累積標高（メートル）
  double calculateElevationGain(List<double> elevations) {
    if (elevations.length < 2) return 0.0;

    double gain = 0.0;
    for (int i = 1; i < elevations.length; i++) {
      final diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        gain += diff;
      }
    }

    return gain;
  }

  /// 標高の最小値と最大値を取得
  ///
  /// [elevations] 標高データのリスト
  /// 戻り値: (最小値, 最大値)のタプル
  (double min, double max) getElevationRange(List<double> elevations) {
    if (elevations.isEmpty) return (0.0, 0.0);

    double min = elevations.first;
    double max = elevations.first;

    for (final elevation in elevations) {
      if (elevation < min) min = elevation;
      if (elevation > max) max = elevation;
    }

    return (min, max);
  }
}
