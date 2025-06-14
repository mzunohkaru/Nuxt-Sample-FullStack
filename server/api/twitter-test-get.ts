export default defineEventHandler(async (event) => {
  // HTTPメソッドを確認してGETのみ許可
  if (getMethod(event) !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    // テスト用の文字列リストを定義
    const testStrings = [
      "こんにちは、世界！",
      "Nuxt.js APIテストです",
      "TypeScriptで開発中",
      "Vue.jsフレームワーク",
      "サーバーサイドレンダリング",
      "レスポンシブデザイン",
      "モダンWeb開発",
      "JavaScriptの進化",
      "フロントエンド技術",
      "バックエンドAPI",
    ];

    console.log(
      `✅ テスト文字列リストを返しています (${testStrings.length}件)`
    );

    return {
      success: true,
      strings: testStrings,
      count: testStrings.length,
      timestamp: new Date().toISOString(),
      message: "テスト用文字列リストの取得に成功しました",
    };
  } catch (error) {
    console.error("❌ テストAPI Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      strings: [],
      count: 0,
      error: "テストAPIでエラーが発生しました",
      details:
        process.env.NODE_ENV === "development" ? errorMessage : undefined,
    };
  }
});
