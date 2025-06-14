import { prisma } from "../../database";

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "GET") {
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
      strings: strings, // users ではなく strings を返す
      count: strings.length,
      timestamp: new Date().toISOString(),
      message: "ユーザーリストの取得に成功しました",
    };
  } catch (error) {
    console.error("❌ Users API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      strings: [],
      count: 0,
      error: "ユーザーAPIでエラーが発生しました",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };
  }
});
