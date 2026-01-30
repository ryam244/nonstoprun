/// 環境変数を管理するクラス
class EnvConstants {
  /// Mapbox Access Token
  /// 環境変数 MAPBOX_ACCESS_TOKEN から取得
  /// ない場合は空文字列
  static const String mapboxAccessToken =
      String.fromEnvironment('MAPBOX_ACCESS_TOKEN', defaultValue: '');

  /// Mapbox Access Tokenが設定されているかチェック
  static bool get hasMapboxToken => mapboxAccessToken.isNotEmpty;

  EnvConstants._();
}
