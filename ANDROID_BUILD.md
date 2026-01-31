# Android ビルド手順書

Non-Stop Run アプリをAndroidでビルドし、Google Play Consoleにアップロードするまでの手順です。

---

## 📋 事前準備

### 必要なもの

- [ ] Android Studio（最新版）
- [ ] Java Development Kit（JDK 17以降）
- [ ] Google Play Console アカウント
- [ ] 署名用のキーストア

---

## 開発環境のセットアップ

### 1. Android Studioのインストール

[公式サイト](https://developer.android.com/studio)からダウンロードしてインストール

### 2. Flutter環境の確認

```bash
flutter doctor
```

以下が✓になっていることを確認：
```
✓ Android toolchain
✓ Android Studio
```

---

## プロジェクトのセットアップ

### 1. 依存関係のインストール

```bash
cd nonstoprun/flutter_app
flutter pub get
```

### 2. 署名鍵の作成

#### 初回のみ（鍵を作成）

```bash
# キーストアを作成
keytool -genkey -v -keystore ~/nonstoprun-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias nonstoprun

# パスワードと情報を入力
# ⚠️ パスワードは必ず記録しておく
```

#### key.propertiesファイルを作成

`flutter_app/android/key.properties`を作成：

```properties
storePassword=<キーストアのパスワード>
keyPassword=<キーのパスワード>
keyAlias=nonstoprun
storeFile=<キーストアファイルのパス（例: /Users/yourname/nonstoprun-key.jks）>
```

⚠️ **重要**: このファイルは `.gitignore` に追加してGitにコミットしないこと

#### build.gradle.ktsを更新

`flutter_app/android/app/build.gradle.kts`を編集：

```kotlin
// ファイルの先頭付近に追加
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = java.util.Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

android {
    // ... 既存の設定 ...

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

---

## ビルド

### 1. バージョン番号の更新

`pubspec.yaml`を編集：

```yaml
version: 1.0.0+1  # 1.0.0がバージョン名、+1がバージョンコード
```

### 2. APKのビルド（テスト用）

```bash
flutter build apk --release
```

生成されたAPK: `build/app/outputs/flutter-apk/app-release.apk`

### 3. App Bundle のビルド（Google Play配信用）

```bash
flutter build appbundle --release
```

生成されたAAB: `build/app/outputs/bundle/release/app-release.aab`

---

## Google Play Consoleにアップロード

### 1. Google Play Consoleでアプリを作成

1. [Google Play Console](https://play.google.com/console) にログイン
2. 「アプリを作成」をクリック
3. アプリ情報を入力：
   - アプリ名: Non-Stop Run
   - デフォルトの言語: 日本語
   - アプリまたはゲーム: アプリ
   - 無料または有料: 無料

### 2. App Bundle をアップロード

1. 「製品版」→「リリース」→「内部テスト」を選択
2. 「新しいリリースを作成」をクリック
3. 「アップロード」をクリックして `app-release.aab` を選択
4. リリースノートを入力
5. 「確認」→「内部テストを開始」

### 3. テスターを追加

1. 「内部テスト」→「テスター」タブ
2. テスターのメールアドレスを追加
3. テスターに招待リンクを送信

---

## デバッグビルド（開発用）

実機でテストする場合：

```bash
# USBデバッグを有効にした実機を接続

# デバイスを確認
flutter devices

# デバッグモードで実行
flutter run
```

---

## トラブルシューティング

### 1. `Gradle build failed`

```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk
```

### 2. `Signing key not found`

- `key.properties` ファイルが正しい場所にあるか確認
- パスが正しいか確認（絶対パス推奨）

### 3. `minSdkVersion too low`

`android/app/build.gradle.kts`で確認：
```kotlin
minSdk = 21  // 最低でも21
```

### 4. `Java version mismatch`

```bash
# Java 17を確認
java -version

# Android Studioの設定でJDK 17を選択
```

---

## チェックリスト

### ビルド前

- [ ] `pubspec.yaml`でバージョンコードを更新
- [ ] 署名鍵を作成済み
- [ ] `key.properties`を設定済み
- [ ] `flutter analyze`でエラーなし

### ビルド

- [ ] `flutter build appbundle --release`成功
- [ ] AAAファイルが生成された

### アップロード

- [ ] Google Play Consoleでアプリ作成
- [ ] App Bundleをアップロード
- [ ] テスターを追加して配信

---

## APKとAABの違い

| 項目 | APK | AAB (App Bundle) |
|------|-----|------------------|
| 用途 | 直接インストール、テスト | Google Play配信 |
| サイズ | 大きい（全デバイス用） | 小さい（デバイス最適化） |
| 配信 | 手動配布可能 | Google Play経由のみ |
| 推奨 | 開発・テスト | 本番リリース |

---

## 参考リンク

- [Flutter - Android Deployment](https://docs.flutter.dev/deployment/android)
- [Google Play Console](https://play.google.com/console)
- [Android Studio](https://developer.android.com/studio)

---

**最終更新**: 2026-01-31
**対象ブランチ**: `claude/rebuild-flutter-app-oMTp6`
