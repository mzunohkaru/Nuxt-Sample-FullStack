import { prisma } from "../../database";

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // ユーザー情報から文字列配列を作成（例：ユーザー名を使用）
    const strings = users.map(
      (user) => user.name || user.email || `User ${user.id}`
    );

    console.log(`✅ ユーザーリストを返しています (${users.length}件)`);

    return {
      success: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      count: users.length,
      timestamp: new Date().toISOString(),
      message: "ユーザーリストの取得に成功しました",
    };
  } catch (error) {
    console.error("❌ Users API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // データベースエラーは500ステータスコードで返す
    throw createError({
      statusCode: 500,
      statusMessage: "ユーザーリスト取得でエラーが発生しました",
      data:
        process.env.NODE_ENV === "development"
          ? { details: errorMessage }
          : undefined,
    });
  }
});
