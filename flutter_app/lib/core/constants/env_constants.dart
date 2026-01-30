/// 環境変数を管理するクラス
class EnvConstants {
  /// Mapbox Access Token
  ///
  /// 本番環境では環境変数から取得することを推奨
  /// 開発時はここに直接APIキーを設定してもOK
  static const String mapboxAccessToken = String.fromEnvironment(
    'MAPBOX_ACCESS_TOKEN',
    defaultValue: 'YOUR_MAPBOX_TOKEN_HERE', // ← ここにAPIキーを貼り付け
  );

  /// Mapbox Access Tokenが設定されているかチェック
  static bool get hasMapboxToken =>
      mapboxAccessToken.isNotEmpty &&
      mapboxAccessToken != 'YOUR_MAPBOX_TOKEN_HERE';

  EnvConstants._();
}
