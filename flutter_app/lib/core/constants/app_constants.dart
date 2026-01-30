/// アプリケーション全体で使用する定数
class AppConstants {
  // デフォルト位置 (東京駅)
  static const double defaultLatitude = 35.6812;
  static const double defaultLongitude = 139.7671;

  // 距離範囲
  static const double minDistance = 1.0;
  static const double maxDistance = 42.0;
  static const double distanceStep = 0.5;

  // 検索範囲 (km)
  static const double searchRadiusKm = 5.0;

  // タイムアウト設定
  static const int locationTimeoutSeconds = 10;
  static const int apiTimeoutSeconds = 30;

  AppConstants._();
}
