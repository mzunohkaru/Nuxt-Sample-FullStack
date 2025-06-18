# TwitterClone プロジェクト - Claude Code 専用ガイド

## プロジェクト概要
Nuxt.js 3 + TypeScript + PostgreSQL で構築されたTwitterクローンアプリケーション。
認証、投稿機能、セキュリティ機能を実装済み。

## 技術スタック
- **フロントエンド**: Vue.js 3, Nuxt.js 3, Nuxt UI
- **バックエンド**: Nuxt Server API, Prisma ORM
- **データベース**: PostgreSQL
- **認証**: JWT + bcryptjs
- **セキュリティ**: CSRF, Rate Limiting, CSP
- **テスト**: Vitest
- **開発環境**: Docker Compose

## よく使用するコマンド

### 開発環境
```bash
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # プロダクションビルド
npm run preview      # プロダクション環境プレビュー
```

### データベース操作
```bash
npm run db:migrate   # マイグレーション実行
npm run db:generate  # Prismaクライアント生成
npm run db:seed      # シードデータ投入
npm run db:studio    # Prisma Studio起動
```

### テスト・品質管理
```bash
npm run test         # テスト実行（ウォッチモード）
npm run test:run     # テスト実行（一回のみ）
npx eslint .         # ESLint実行
```

## ディレクトリ構造
```
/
├── server/api/        # API エンドポイント
│   ├── auth/         # 認証関連API
│   ├── posts/        # 投稿関連API
│   └── users/        # ユーザー関連API
├── server/middleware/ # サーバーミドルウェア
├── server/schemas/    # バリデーションスキーマ
├── server/utils/      # サーバーユーティリティ
├── prisma/           # データベース設定
├── types/            # TypeScript型定義
└── test/             # テストファイル
```

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン  
- `POST /api/auth/logout` - ログアウト

### 投稿
- `GET /api/posts` - 投稿一覧
- `POST /api/posts` - 投稿作成
- `PUT /api/posts/[id]` - 投稿更新
- `DELETE /api/posts/[id]` - 投稿削除

### ユーザー
- `GET /api/users` - ユーザー一覧
- `GET /api/users/[id]` - ユーザー詳細

## データベーススキーマ

### User テーブル
- id (Primary Key)
- email (Unique)
- name
- password (bcrypt ハッシュ化済み)
- posts (Post[] リレーション)

### Post テーブル  
- id (Primary Key)
- content (120文字制限)
- userId (Foreign Key)
- user (User リレーション)

## 環境変数
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CSRF_SECRET="your-csrf-secret"
LOG_LEVEL="info"
ALLOWED_ORIGINS="http://localhost:3000"
```

## 開発時の注意事項

### セキュリティ
- JWT シークレットは本番環境で必ず変更
- CSRF トークンの検証を忘れずに
- 入力値は必ずZodスキーマで検証
- パスワードは bcryptjs でハッシュ化

### データベース
- マイグレーション後は必ず `db:generate` 実行
- シードデータは開発環境でのみ使用
- 本番環境では適切なバックアップ戦略を実装

### テスト
- 新機能実装時は必ずテストを追加
- API エンドポイントは統合テストで検証
- テスト実行前にテストデータベースの準備

## 実装済み機能
- ✅ ユーザー認証システム
- ✅ 投稿CRUD操作
- ✅ セキュリティ機能（CSRF, Rate Limiting）
- ✅ バリデーション・サニタイゼーション
- ✅ ログ管理
- ✅ テスト環境

## 今後の開発優先度

### High Priority
1. ユーザープロフィール機能
2. いいね機能  
3. テスト充実化

### Medium Priority
1. ページネーション
2. 画像投稿機能
3. ハッシュタグ機能

## トラブルシューティング

### よくある問題
1. **データベース接続エラー**
   - Docker Composeが起動しているか確認
   - DATABASE_URL の設定確認

2. **マイグレーションエラー**
   - `npm run db:generate` 実行
   - スキーマファイルの構文確認

3. **JWT エラー**
   - JWT_SECRET 設定確認
   - トークンの有効期限確認

4. **CSRF エラー**
   - CSRFトークンの送信確認
   - CORS設定の確認