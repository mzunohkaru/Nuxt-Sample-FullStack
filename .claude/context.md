# TwitterClone プロジェクトコンテキスト

## プロジェクト概要
- **名前**: TwitterClone (nuxt-app)
- **タイプ**: ソーシャルメディアアプリケーション（Twitterクローン）
- **フレームワーク**: Nuxt.js 3
- **言語**: TypeScript
- **データベース**: PostgreSQL (Prisma ORM)

## 技術スタック

### フロントエンド
- **Vue.js 3** - リアクティブフレームワーク
- **Nuxt.js 3** - Vue.jsベースのフルスタックフレームワーク
- **Nuxt UI** - UIコンポーネントライブラリ
- **Nuxt Icon** - アイコンシステム
- **Nuxt Image** - 画像最適化

### バックエンド
- **Nuxt.js Server API** - サーバーサイドAPI
- **Prisma** - データベースORM
- **PostgreSQL** - データベース
- **JWT** - 認証システム
- **bcryptjs** - パスワードハッシュ化
- **Winston** - ログ管理
- **Zod** - スキーマバリデーション

### 開発・テスト
- **TypeScript** - 型安全性
- **ESLint** - コード品質
- **Vitest** - テストフレームワーク
- **Docker Compose** - 開発環境

## データベース設計

### User テーブル
- id (Primary Key)
- email (Unique)
- name
- password (ハッシュ化済み)
- createdAt/updatedAt

### Post テーブル
- id (Primary Key)
- content (120文字制限)
- userId (Foreign Key to User)
- createdAt/updatedAt

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト

### 投稿
- `GET /api/posts` - 投稿一覧取得
- `POST /api/posts` - 投稿作成
- `PUT /api/posts/[id]` - 投稿更新
- `DELETE /api/posts/[id]` - 投稿削除

### ユーザー
- `GET /api/users` - ユーザー一覧
- `GET /api/users/[id]` - ユーザー詳細

## セキュリティ機能
- CSRF Protection
- Rate Limiting
- Content Security Policy
- CORS設定
- JWT認証
- パスワードハッシュ化
- 入力サニタイゼーション

## 開発環境設定
- Node.js プロジェクト
- Docker Compose でPostgreSQL
- 開発サーバー: localhost:3000
- Prisma Studio: データベースGUI

## 主要なスクリプト
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run test` - テスト実行
- `npm run db:migrate` - マイグレーション実行
- `npm run db:seed` - シードデータ投入