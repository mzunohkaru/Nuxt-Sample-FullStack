<template>
  <div class="min-h-screen p-8 bg-gray-50">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        String List API Demo
      </h1>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-700">文字列一覧</h2>
          <button
            @click="fetchStrings"
            :disabled="loading"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            {{ loading ? "読み込み中..." : "データを取得" }}
          </button>
        </div>

        <div
          v-if="error"
          class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          エラー: {{ error }}
        </div>

        <div
          v-if="strings.length === 0 && !loading"
          class="text-gray-500 text-center py-8"
        >
          データがありません。「データを取得」ボタンをクリックしてください。
        </div>

        <div v-if="strings.length > 0" class="space-y-3">
          <div class="mb-4 text-sm text-gray-600">
            合計: {{ stringCount }} 件
          </div>
          <div
            v-for="(str, index) in strings"
            :key="index"
            class="p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-800">{{ str }}</span>
              <span class="text-sm text-gray-500">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ApiResponse {
  success: boolean;
  strings: string[];
  count: number;
  timestamp: string;
  message: string;
}

const strings = ref<string[]>([]);
const stringCount = ref<number>(0);
const loading = ref<boolean>(false);
const error = ref<string>("");

const fetchStrings = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await $fetch<ApiResponse>("/api/users");

    if (response.success) {
      strings.value = response.strings;
      stringCount.value = response.count;
    } else {
      error.value = "APIからの応答でエラーが発生しました";
    }
  } catch (err) {
    error.value = "APIの呼び出しに失敗しました";
    console.error("API呼び出しエラー:", err);
  } finally {
    loading.value = false;
  }
};

// ページ読み込み時に自動的にデータを取得
onMounted(() => {
  fetchStrings();
});
</script>
