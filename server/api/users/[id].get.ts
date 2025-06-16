import { prisma } from "../../database";

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ユーザーIDが指定されていません",
      });
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "ユーザーIDは数値である必要があります",
      });
    }

    if (userId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ユーザーIDは正の値である必要があります",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "指定されたユーザーが見つかりません",
      });
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
    console.error(
      `❌ User API Error (ID: ${getRouterParam(event, "id")}):`,
      error
    );

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    throw createError({
      statusCode: 500,
      statusMessage: "ユーザーAPIでエラーが発生しました",
      data:
        process.env.NODE_ENV === "development"
          ? { details: errorMessage }
          : undefined,
    });
  }
});
