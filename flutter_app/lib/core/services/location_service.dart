import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../constants/app_constants.dart';

/// 位置情報取得サービス
class LocationService {
  /// 位置情報の権限を確認
  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  /// 位置情報の権限をリクエスト
  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  /// 位置情報サービスが有効かどうか
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// 現在位置を取得
  Future<LatLng?> getCurrentLocation() async {
    try {
      // 位置情報サービスが有効かチェック
      final serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      // 権限チェック
      LocationPermission permission = await checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      // 現在位置を取得
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: AppConstants.locationTimeoutSeconds),
        ),
      );

      return LatLng(position.latitude, position.longitude);
    } catch (e) {
      // エラー時はnullを返す
      return null;
    }
  }

  /// デフォルト位置を取得 (東京駅)
  LatLng getDefaultLocation() {
    return const LatLng(
      AppConstants.defaultLatitude,
      AppConstants.defaultLongitude,
    );
  }

  /// 位置情報の変更をストリームで取得
  Stream<LatLng> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // 10m移動したら更新
      ),
    ).map((position) => LatLng(position.latitude, position.longitude));
  }

  /// 2点間の距離を計算 (メートル)
  double calculateDistance(LatLng from, LatLng to) {
    return Geolocator.distanceBetween(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );
  }
}
