# Non-Stop Run - プロジェクト計画書

## 1. プロジェクト概要

**Non-Stop Run** は、信号待ちのストレスからランナーを解放する、ランニングコース自動生成アプリです。

### コンセプト
「最高のランニング体験は、最高のコースから始まる」

- **解決する課題**: 信号待ちによるペース乱れ・モチベーション低下
- **コアバリュー**: 距離を入力するだけで信号の少ない周回コースを自動生成
- **差別化**: 既存アプリは「走った後」の記録、本アプリは「走る前」のコース設計に特化

### ターゲットペルソナ
1. **佐藤健太（32歳）** - サブ3.5目標の本格派ランナー
2. **鈴木美咲（28歳）** - 習慣化したい初心者ランナー

---

## 2. 現在の状況

**フェーズ**: MVP開発 - コア機能実装完了

### 完了項目
- [x] プロジェクト初期化（Expo SDK 54 + TypeScript）
- [x] ディレクトリ構造の作成
- [x] テーマファイルの作成（デザインHTML分析済み）
- [x] Expo Routerの基本設定
- [x] タブナビゲーション実装（5タブ）
- [x] ホーム画面（コース作成）のUI実装
- [x] コース選択画面のUI実装
- [x] ナビゲーション画面のUI実装
- [x] **Mapbox GL統合**
- [x] **GraphHopper APIクライアント（モック対応）**
- [x] **位置情報取得hook（useLocation）**
- [x] **コース生成サービス**
- [x] **Zustand Store実装**

### 次のステップ
- [ ] Mapboxトークン設定（実機テスト時）
- [ ] GraphHopperサーバー構築（ConoHa）
- [ ] 信号情報取得（OSM Overpass API）
- [ ] 実機テスト

---

## 3. 技術仕様

### スタック
```yaml
基本構成:
  - React Native + Expo (SDK 54)
  - TypeScript (strict mode)
  - Expo Router (ファイルベースルーティング)

状態管理:
  - Zustand

地図・ルート生成:
  - 地図表示: Mapbox GL (@rnmapbox/maps)
  - ルート生成: GraphHopper (セルフホスト on ConoHa)
  - 地図データ: OpenStreetMap

UIライブラリ:
  - @expo/vector-icons (Ionicons)
  - react-native-safe-area-context
```

### ディレクトリ構造
```
nonstoprun/
├── app/                    # Expo Router
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # ホーム（コース作成）
│   │   ├── community.tsx
│   │   ├── training.tsx
│   │   ├── events.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # ルートレイアウト
│   ├── course-select.tsx  # コース選択
│   └── navigation.tsx     # ナビゲーション
├── src/
│   ├── components/        # 再利用コンポーネント
│   │   └── MapView.tsx    # 地図コンポーネント
│   ├── hooks/
│   │   └── useLocation.ts # 位置情報hook
│   ├── stores/
│   │   └── appStore.ts    # Zustand store
│   ├── services/
│   │   ├── config.ts      # API設定
│   │   ├── graphhopper.ts # ルート生成API
│   │   └── courseGenerator.ts # コース生成
│   ├── types/
│   │   └── index.ts       # 型定義
│   └── theme/
│       └── index.ts       # テーマ設定
├── assets/                # 画像・フォント
├── docs/                  # ドキュメント
├── .env.example           # 環境変数テンプレート
└── PROJECT_PLAN.md
```

### 環境変数
```bash
# .env.example
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
EXPO_PUBLIC_GRAPHHOPPER_API_URL=https://your-conoha-server.com/graphhopper
EXPO_PUBLIC_USE_MOCK_API=true  # 開発中はtrue
```

---

## 4. 地図API展開計画

### Phase 1: 日本主要都市部
対応エリア（半径km）:
- 東京（30km）
- 大阪（20km）
- 名古屋（15km）
- 横浜（15km）
- 福岡（15km）
- 札幌（15km）
- 神戸（10km）
- 京都（10km）

### Phase 2: 日本全国
- GraphHopperに日本全域のOSMデータをロード
- サーバースペック増強が必要

### Phase 3: 全世界対応
- GraphHopper API（有料版）に移行
- セルフホストからクラウドAPI版へ

---

## 5. MVP実装ロードマップ

### Phase 1: 基盤構築 ✅
- [x] Expo プロジェクト初期化
- [x] TypeScript 設定
- [x] ディレクトリ構造作成
- [x] テーマファイル作成
- [x] Expo Router 設定

### Phase 2: UI実装 ✅
- [x] タブナビゲーション
- [x] ホーム画面（コース作成）
- [x] コース選択画面
- [x] ナビゲーション画面
- [x] プレースホルダー画面

### Phase 3: コア機能 ✅
- [x] Mapbox GL統合
- [x] 位置情報取得
- [x] GraphHopper APIクライアント
- [x] コース生成ロジック（モック対応）
- [x] Zustand Store

### Phase 4: 仕上げ（進行中）
- [ ] 実機テスト
- [ ] エラーハンドリング強化
- [ ] ダークモード最適化
- [ ] パフォーマンス最適化

---

## 6. 画面遷移フロー

```
[ホーム] ──「コースを探す」──> [コース選択] ──「開始する」──> [ナビゲーション]
   ↑                              │
   └─────────「戻る」──────────────┘
```

---

## 7. 次のアクション

1. **Mapboxトークン取得**: https://account.mapbox.com/ でアカウント作成
2. **GraphHopperサーバー構築**: ConoHaにDockerでデプロイ
3. **OSMデータ準備**: 日本主要都市のPBFファイル取得
4. **実機テスト**: iOS Simulatorまたは実機でテスト

---

## 更新履歴

| 日付 | 更新内容 |
|------|----------|
| 2026-01-20 | 初版作成。MVP開発準備完了 |
| 2026-01-20 | 地図API統合完了（Mapbox + GraphHopper） |
