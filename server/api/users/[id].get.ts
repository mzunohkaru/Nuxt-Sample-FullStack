import { prisma } from "../../database";

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const id = getRouterParam(event, 'id');
    
    const userId = parseInt(id || '', 10);
    if (isNaN(userId) || userId <= 0) {
      return {
        success: false,
        user: null,
        error: "無効なユーザーIDです",
        timestamp: new Date().toISOString(),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        user: null,
        error: "指定されたユーザーが見つかりません",
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`✅ ユーザー情報を返しています (ID: ${userId})`);
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
      message: "ユーザー情報の取得に成功しました",
    };

  } catch (error) {
    console.error(`❌ User API Error (ID: ${getRouterParam(event, 'id')}):`, error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      user: null,
      error: "ユーザーAPIでエラーが発生しました",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      timestamp: new Date().toISOString(),
    };
  }
});
