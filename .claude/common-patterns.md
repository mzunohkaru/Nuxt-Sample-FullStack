# 共通パターンとベストプラクティス

## API開発パターン

### エンドポイント作成の基本形
```typescript
// server/api/example.post.ts
import { z } from 'zod'

const schema = z.object({
  // バリデーションスキーマ定義
})

export default defineEventHandler(async (event) => {
  try {
    // リクエストボディの検証
    const body = await readBody(event)
    const validatedData = schema.parse(body)
    
    // ビジネスロジック実行
    
    return { success: true, data: result }
  } catch (error) {
    // エラーハンドリング
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request'
    })
  }
})
```

### データベースアクセスパターン
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 基本的なCRUD操作
const user = await prisma.user.create({
  data: { name, email, password }
})

const posts = await prisma.post.findMany({
  include: { user: true },
  orderBy: { createdAt: 'desc' }
})
```

## 認証パターン

### JWT認証の実装
```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// パスワードハッシュ化
const hashedPassword = await bcrypt.hash(password, 10)

// JWT生成
const token = jwt.sign(
  { userId: user.id },
  useRuntimeConfig().jwtSecret,
  { expiresIn: '24h' }
)
```

### 認証ミドルウェア
```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // 認証が必要なエンドポイントの判定
  if (event.node.req.url?.startsWith('/api/protected')) {
    // JWT検証ロジック
  }
})
```

## バリデーションパターン

### Zodスキーマ定義
```typescript
// server/schemas/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6)
})

export const postSchema = z.object({
  content: z.string().min(1).max(120)
})
```

## エラーハンドリングパターン

### 統一されたエラーレスポンス
```typescript
// server/utils/errorHandler.ts
export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: error.errors
    })
  }
  
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error'
  })
}
```

## テストパターン

### APIテストの基本形
```typescript
// test/api/users.test.ts
import { describe, it, expect } from 'vitest'

describe('/api/users', () => {
  it('should return users list', async () => {
    // テスト実装
  })
})
```

## セキュリティパターン

### CSRF保護
```typescript
// server/middleware/csrf.ts
export default defineEventHandler(async (event) => {
  // CSRF トークン検証
})
```

### レート制限
```typescript
// server/middleware/rateLimit.ts
export default defineEventHandler(async (event) => {
  // レート制限ロジック
})
```

## デプロイメントパターン

### 環境変数管理
```bash
# .env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CSRF_SECRET="your-csrf-secret"
LOG_LEVEL="info"
```

### Docker Compose設定
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: twitterclone
      # 他の設定
```

## コード規約

### ファイル命名規則
- API: `[endpoint].[method].ts`
- コンポーネント: PascalCase
- ユーティリティ: camelCase
- 型定義: PascalCase (types/)

### インポート順序
1. Node.js標準モジュール
2. 外部ライブラリ
3. 内部モジュール（相対パス）

### コメント規約
- 複雑なビジネスロジックには説明を追加
- TODO: で今後の改善点を記録
- FIXME: で既知の問題を記録