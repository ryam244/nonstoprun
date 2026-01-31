# クイックスタートガイド

ローカルPCで素早くビルド・テストするための最小限の手順です。

---

## 🚀 5ステップでTestFlightへ

### Step 1: リポジトリをクローン/更新

```bash
# 初回
git clone https://github.com/ryam244/nonstoprun.git
cd nonstoprun

# 2回目以降（最新版を取得）
cd nonstoprun
git checkout claude/rebuild-flutter-app-oMTp6
git pull origin claude/rebuild-flutter-app-oMTp6
```

### Step 2: 依存関係をインストール

```bash
cd flutter_app
flutter clean
flutter pub get
cd ios
pod install
cd ..
```

### Step 3: バージョン番号を更新

`pubspec.yaml`を編集：
```yaml
version: 1.0.0+2  # +の後ろの数字を増やす
```

### Step 4: Xcodeでビルド

```bash
cd ios
open Runner.xcworkspace
```

Xcodeで：
1. **Signing & Capabilities** → Teamを選択
2. **Product** → **Archive**

### Step 5: TestFlightにアップロード

Organizerウィンドウで：
1. **Distribute App**
2. **App Store Connect** → Upload

完了！App Store Connectで確認してテスター招待。

---

## ⚡ トラブル時の即効薬

### ビルドエラー
```bash
cd flutter_app
flutter clean
rm -rf ios/Pods ios/Podfile.lock
flutter pub get
cd ios && pod install && cd ..
```

### 証明書エラー
Xcodeで **Signing & Capabilities** → Team を再選択

### アップロードエラー
`pubspec.yaml`のバージョン番号（+の後ろ）を増やす

---

詳細は [TESTFLIGHT_DEPLOY.md](./TESTFLIGHT_DEPLOY.md) を参照
