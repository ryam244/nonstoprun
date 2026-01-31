# TestFlight デプロイ手順書

Non-Stop Run アプリをローカルPCでビルドし、TestFlightで配信するまでの完全ガイドです。

---

## 📋 目次

1. [事前準備](#事前準備)
2. [リポジトリのクローン](#リポジトリのクローン)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
5. [iOS証明書とプロビジョニングプロファイルの設定](#ios証明書とプロビジョニングプロファイルの設定)
6. [ビルド](#ビルド)
7. [TestFlightへのアップロード](#testflightへのアップロード)
8. [トラブルシューティング](#トラブルシューティング)

---

## 事前準備

### 必要なもの

- [ ] macOS搭載のPC（Xcodeが必要なため）
- [ ] Apple Developer Account（有料アカウント）
- [ ] App Store Connect へのアクセス権限
- [ ] GitHubアカウントとリポジトリへのアクセス権

### 必要なツール

- [ ] Xcode（最新版推奨）
- [ ] Flutter SDK（3.10.8以降）
- [ ] Git
- [ ] CocoaPods（iOSの依存関係管理）

---

## リポジトリのクローン

### 1. 初回クローン

```bash
# ターミナルを開く
cd ~/Documents  # または任意の作業ディレクトリ

# リポジトリをクローン
git clone https://github.com/ryam244/nonstoprun.git
cd nonstoprun
```

### 2. 既にクローン済みの場合（最新版を取得）

```bash
cd ~/Documents/nonstoprun  # リポジトリのパス

# 最新の変更を取得
git fetch origin

# 作業ブランチに切り替え
git checkout claude/rebuild-flutter-app-oMTp6

# 最新版にアップデート
git pull origin claude/rebuild-flutter-app-oMTp6
```

---

## 開発環境のセットアップ

### 1. Xcodeのインストール

```bash
# App StoreからXcodeをインストール
# または以下のコマンド
xcode-select --install
```

### 2. Flutterのインストール

```bash
# Homebrewを使用する場合
brew install flutter

# または公式サイトからダウンロード
# https://docs.flutter.dev/get-started/install/macos
```

### 3. Flutter環境の確認

```bash
flutter doctor
```

以下のような出力が表示されることを確認：
```
✓ Flutter (Channel stable, 3.x.x)
✓ Xcode - develop for iOS and macOS
✓ iOS tools
```

### 4. CocoaPodsのインストール

```bash
sudo gem install cocoapods
```

---

## プロジェクトのセットアップ

### 1. Flutterプロジェクトディレクトリに移動

```bash
cd nonstoprun/flutter_app
```

### 2. 依存関係のインストール

```bash
# Flutterパッケージを取得
flutter pub get

# iOSの依存関係をインストール
cd ios
pod install
cd ..
```

### 3. ビルドのクリーンアップ（推奨）

```bash
flutter clean
flutter pub get
```

---

## iOS証明書とプロビジョニングプロファイルの設定

### 1. App Store Connectでアプリを作成

1. [App Store Connect](https://appstoreconnect.apple.com/) にログイン
2. 「マイApp」→「+」→「新規App」をクリック
3. 以下の情報を入力：
   - **プラットフォーム**: iOS
   - **名前**: Non-Stop Run（または任意の名前）
   - **プライマリ言語**: 日本語
   - **バンドルID**: `com.nonstoprun.flutter_app`
   - **SKU**: `nonstoprun-1`（任意）
   - **ユーザーアクセス**: フルアクセス

### 2. Xcodeで証明書を設定

```bash
# Xcodeでプロジェクトを開く
cd nonstoprun/flutter_app/ios
open Runner.xcworkspace
```

Xcodeで以下の手順を実行：

1. **プロジェクトナビゲータ**で「Runner」を選択
2. **Signing & Capabilities**タブを開く
3. **Automatically manage signing**にチェック
4. **Team**でApple Developer Teamを選択
5. **Bundle Identifier**が`com.nonstoprun.flutter_app`であることを確認

### 3. App Transport Security設定（必要な場合）

`ios/Runner/Info.plist`に以下が含まれていることを確認：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

---

## ビルド

### 1. バージョン番号の更新

`pubspec.yaml`を編集してバージョンを更新：

```yaml
version: 1.0.0+1  # 1.0.0がバージョン名、+1がビルド番号
```

リリースごとにビルド番号を増やす（例: `1.0.0+2`, `1.0.0+3`）

### 2. アーカイブ（Archive）の作成

#### 方法A: Xcodeを使用（推奨）

```bash
# Xcodeでプロジェクトを開く
cd flutter_app/ios
open Runner.xcworkspace
```

Xcodeで：
1. メニュー → **Product** → **Destination** → **Any iOS Device (arm64)**
2. メニュー → **Product** → **Archive**
3. ビルドが完了するまで待機（数分かかります）

#### 方法B: コマンドラインを使用

```bash
cd flutter_app

# Releaseモードでビルド
flutter build ios --release

# または、直接アーカイブを作成
flutter build ipa
```

### 3. ビルドの確認

エラーが表示されないことを確認します。

---

## TestFlightへのアップロード

### 1. Xcodeからアップロード

アーカイブが完了したら、Xcodeの**Organizer**ウィンドウが自動的に開きます。

1. 作成したアーカイブを選択
2. **Distribute App**をクリック
3. **App Store Connect**を選択 → **Next**
4. **Upload**を選択 → **Next**
5. 証明書とプロビジョニングプロファイルを確認 → **Next**
6. **Upload**をクリック

アップロードには数分〜10分程度かかります。

### 2. App Store Connectで確認

1. [App Store Connect](https://appstoreconnect.apple.com/) にアクセス
2. 「マイApp」→「Non-Stop Run」を選択
3. 「TestFlight」タブをクリック
4. 「iOS」セクションでビルドが表示されるまで待機（5〜15分）
   - 表示されるまで「処理中」と表示されます

### 3. TestFlightの設定

ビルドが表示されたら：

1. ビルドをクリック
2. **テスト情報**を入力：
   - 新機能の説明
   - テスト対象
3. **輸出コンプライアンス情報**を入力：
   - 「このAppは暗号化を使用していますか？」→ **いいえ**（通常の場合）
4. 保存

### 4. 内部テスターを追加

1. 「TestFlight」→「内部テスト」タブ
2. **「+」**ボタンをクリック
3. テスターを追加（Apple IDメールアドレス）
4. ビルドを選択して配信

### 5. 外部テスターを追加（オプション）

1. 「TestFlight」→「外部テスト」タブ
2. **「+」**ボタンをクリック
3. グループ名を入力
4. テスターを追加
5. Appleのレビューに提出

---

## トラブルシューティング

### ビルドエラー

#### 1. `CocoaPods not installed`

```bash
sudo gem install cocoapods
cd ios
pod install
```

#### 2. `No valid code signing certificate found`

- Xcodeで**Signing & Capabilities**を確認
- Teamが正しく選択されているか確認
- 必要に応じて証明書を再生成

#### 3. `Provisioning profile doesn't match`

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

その後、Xcodeで再度Signingを設定

#### 4. `Flutter SDK not found`

```bash
# Flutterのパスを確認
which flutter

# パスを追加（必要な場合）
echo 'export PATH="$PATH:/path/to/flutter/bin"' >> ~/.zshrc
source ~/.zshrc
```

### アップロードエラー

#### 1. `Invalid IPA`

- ビルド番号が前回より大きいことを確認
- `pubspec.yaml`のバージョンを更新

#### 2. `Missing compliance`

- TestFlightで輸出コンプライアンス情報を入力

#### 3. `Processing timeout`

- App Store Connectで15分以上「処理中」の場合
- 再度アップロードを試す
- Apple Developer Support に問い合わせ

---

## チェックリスト

### デプロイ前

- [ ] 最新のコードをGitHubからプル
- [ ] `flutter clean && flutter pub get`を実行
- [ ] `pubspec.yaml`でバージョン番号を更新
- [ ] `flutter analyze`でエラーがないことを確認
- [ ] Mapbox APIキーが設定されていることを確認

### ビルド

- [ ] Xcodeで証明書とTeamを設定
- [ ] Archiveを作成
- [ ] エラーなくビルドが完了

### TestFlight

- [ ] App Store Connectにアップロード完了
- [ ] ビルドが「処理中」から「テスト準備完了」に変更
- [ ] テスト情報と輸出コンプライアンスを入力
- [ ] テスターを追加してビルドを配信

---

## よくある質問

### Q1: 初回ビルドにどのくらい時間がかかりますか？

**A**: 環境によりますが、通常15〜30分程度です。
- 依存関係のインストール: 5〜10分
- ビルド: 5〜10分
- アップロード: 5〜10分

### Q2: TestFlightで配信できるテスター数は？

**A**:
- **内部テスター**: 最大100人（即座に配信）
- **外部テスター**: 最大10,000人（Appleのレビューが必要）

### Q3: ビルド番号は毎回更新が必要ですか？

**A**: はい。App Store Connectは同じビルド番号のアップロードを拒否します。

### Q4: 開発中のブランチからビルドしても大丈夫ですか？

**A**: テスト目的であれば問題ありません。本番リリースの場合は`main`または`release`ブランチからビルドすることを推奨します。

---

## 参考リンク

- [Flutter公式ドキュメント - iOS Deployment](https://docs.flutter.dev/deployment/ios)
- [Apple Developer - TestFlight](https://developer.apple.com/testflight/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Xcode Help](https://help.apple.com/xcode/)

---

## サポート

問題が発生した場合：

1. このドキュメントのトラブルシューティングを確認
2. Flutter公式ドキュメントを参照
3. GitHubのIssueを作成
4. Apple Developer Supportに問い合わせ

---

**最終更新**: 2026-01-31
**対象ブランチ**: `claude/rebuild-flutter-app-oMTp6`
**Flutterバージョン**: 3.10.8以降
**Xcodeバージョン**: 15.0以降推奨
