import { prisma } from '../../database'

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
        createdAt: 'desc'
      }
    });

    console.log(`✅ ユーザーリストを返しています (${users.length}件)`);

    return {
      success: true,
      users: users,
      count: users.length,
      timestamp: new Date().toISOString(),
      message: "ユーザーリストの取得に成功しました",
    };
  } catch (error) {
    console.error("❌ Users API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      users: [],
      count: 0,
      error: "ユーザーAPIでエラーが発生しました",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };
  }
});
