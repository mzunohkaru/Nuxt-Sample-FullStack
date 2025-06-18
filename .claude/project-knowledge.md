# プロジェクト技術的知見

## アーキテクチャパターン

### ディレクトリ構造
```
/
├── server/              # サーバーサイドコード
│   ├── api/            # API エンドポイント
│   ├── middleware/     # ミドルウェア
│   ├── schemas/        # バリデーションスキーマ
│   └── utils/          # ユーティリティ関数
├── prisma/             # データベース設定
├── types/              # TypeScript型定義
├── test/               # テストファイル
└── public/             # 静的ファイル
```

### API設計原則
- RESTful API設計
- Zodスキーマによるバリデーション
- エラーハンドリングの統一
- レート制限の実装
- CSRF保護

## データベース関連

### Prisma使用パターン
- マイグレーション管理
- シードデータの活用
- 型安全なクエリ
- リレーション設定

### パフォーマンス考慮
- Post.contentに120文字制限
- インデックス設計（email unique）
- 適切なリレーション設定

## セキュリティ実装

### 認証・認可
- JWT トークンベース認証
- bcryptjs によるパスワードハッシュ化
- セッション管理

### セキュリティヘッダー
- CSP (Content Security Policy)
- CORS設定
- セキュリティヘッダーの適切な設定

### 入力検証
- Zodスキーマによる型安全な検証
- サニタイゼーション実装
- SQLインジェクション対策

## Nuxt.js 固有の実装

### Server API
- `/server/api/` ディレクトリでのAPI定義
- ファイルベースルーティング
- ミドルウェアの活用

### モジュール構成
- @nuxt/ui - デザインシステム
- @nuxt/icon - アイコン管理
- @nuxt/image - 画像最適化
- @nuxt/eslint - コード品質

## テスト戦略

### テスト環境
- Vitest テストランナー
- @nuxt/test-utils 活用
- jsdom環境でのテスト

### テストパターン
- API エンドポイントテスト
- ユニットテスト
- 統合テスト

## 開発プロセス

### 品質管理
- ESLint設定
- TypeScript厳格モード
- Git フック活用可能

### 環境管理
- 環境変数による設定管理
- Docker Compose活用
- 開発/本番環境分離

## よく使用するコマンド
```bash
# 開発
npm run dev

# データベース
npm run db:migrate
npm run db:generate
npm run db:seed
npm run db:studio

# テスト
npm run test
npm run test:run

# ビルド
npm run build
npm run preview
```