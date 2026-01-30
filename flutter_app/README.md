# Non-Stop Run - Flutter App

信号のないランニングコースを自動生成するFlutterアプリ

## 機能

- 📍 現在位置の自動取得
- 🗺️ Mapbox地図表示
- 🚦 Overpass APIによる信号データ取得
- 🏃 距離入力ホイール (1.0km〜42.0km)
- 📊 コース提案 (公園優先、緑道優先、フラット)

## セットアップ

### 1. Flutter SDKのインストール

```bash
# Flutterが既にインストールされている場合はスキップ
flutter doctor
```

### 2. 依存関係のインストール

```bash
cd flutter_app
flutter pub get
```

### 3. Mapbox Access Tokenの設定

Mapbox APIキーを環境変数に設定します。

**方法1: コマンドラインで実行**

```bash
flutter run --dart-define=MAPBOX_ACCESS_TOKEN=your_actual_token_here
```

**方法2: launch.jsonに設定 (VS Code)**

`.vscode/launch.json` を作成:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "flutter_app",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=MAPBOX_ACCESS_TOKEN=your_actual_token_here"
      ]
    }
  ]
}
```

### 4. 実行

```bash
# 開発モード
flutter run --dart-define=MAPBOX_ACCESS_TOKEN=your_token

# リリースビルド (Android)
flutter build apk --release --dart-define=MAPBOX_ACCESS_TOKEN=your_token

# リリースビルド (iOS)
flutter build ios --release --dart-define=MAPBOX_ACCESS_TOKEN=your_token
```

## プロジェクト構成

```
lib/
├── main.dart                   # エントリーポイント
├── app.dart                    # アプリルート
├── core/
│   ├── theme/                  # テーマ定義
│   ├── router/                 # ルーティング
│   ├── services/               # 共通サービス
│   ├── providers/              # 共通Provider
│   └── constants/              # 定数
├── features/
│   ├── home/                   # ホーム画面
│   │   ├── presentation/
│   │   └── providers/
│   ├── course/                 # コース提案画面
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── map/                    # 地図関連
│       ├── data/
│       ├── domain/
│       └── providers/
└── shared/                     # 共通ウィジェット
```

## 使用技術

- **Flutter**: 3.38.9
- **State Management**: Riverpod 2.6.1
- **Routing**: go_router 14.6.2
- **Map**: mapbox_maps_flutter 2.3.0
- **Location**: geolocator 13.0.2
- **HTTP**: dio 5.7.0

## API

### Mapbox

地図表示に使用。以下から無料アカウントを作成してAPIキーを取得:
https://www.mapbox.com/

### Overpass API

OpenStreetMapデータから信号情報を取得。APIキー不要:
https://overpass-api.de/

## 権限

### Android

`android/app/src/main/AndroidManifest.xml`:
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

### iOS

`ios/Runner/Info.plist`:
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

## トラブルシューティング

### 位置情報が取得できない

1. デバイスの位置情報サービスが有効か確認
2. アプリに位置情報の権限が付与されているか確認
3. エミュレータの場合、位置情報をシミュレート

### 地図が表示されない

1. Mapbox Access Tokenが正しく設定されているか確認
2. ネットワーク接続を確認
3. `EnvConstants.hasMapboxToken` がtrueを返すか確認

### 信号データが取得できない

1. ネットワーク接続を確認
2. Overpass APIのステータスを確認: https://overpass-api.de/api/status
3. 検索範囲を調整してリトライ

## 開発

```bash
# コード解析
flutter analyze

# テスト実行
flutter test

# フォーマット
flutter format lib/
```

## ライセンス

MIT License
