<template>
  <div class="min-h-screen p-8 bg-gray-50">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">掲示板</h1>

      <!-- 投稿フォーム -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">新規投稿</h2>

        <div class="space-y-4">
          <div>
            <textarea
              v-model="newPostContent"
              placeholder="投稿内容を入力してください..."
              class="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxlength="120"
            ></textarea>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm text-gray-500">
                {{ newPostContent.length }}/120文字
              </span>
              <div class="space-x-2">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    v-model="isAnonymous"
                    class="rounded border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-600">匿名で投稿</span>
                </label>
              </div>
            </div>
          </div>

          <button
            @click="createPost"
            :disabled="!newPostContent.trim() || creating"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-md transition-colors"
          >
            {{ creating ? "投稿中..." : "投稿する" }}
          </button>
        </div>
      </div>

      <!-- 投稿リスト -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-700">投稿一覧</h2>
          <button
            @click="fetchPosts"
            :disabled="loading"
            class="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            {{ loading ? "読み込み中..." : "更新" }}
          </button>
        </div>

        <div
          v-if="error"
          class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          エラー: {{ error }}
        </div>

        <div
          v-if="posts.length === 0 && !loading"
          class="text-gray-500 text-center py-8"
        >
          まだ投稿がありません。
        </div>

        <div v-if="posts.length > 0" class="space-y-4">
          <div
            v-for="post in posts"
            :key="post.id"
            class="p-4 bg-gray-50 border border-gray-200 rounded-md"
          >
            <div v-if="editingPost?.id === post.id" class="space-y-3">
              <textarea
                v-model="editContent"
                class="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                maxlength="120"
              ></textarea>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500"
                  >{{ editContent.length }}/120文字</span
                >
                <div class="space-x-2">
                  <button
                    @click="updatePost"
                    :disabled="!editContent.trim() || updating"
                    class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm"
                  >
                    {{ updating ? "更新中..." : "更新" }}
                  </button>
                  <button
                    @click="cancelEdit"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-gray-800">
                      {{ post.user?.name || "匿名ユーザー" }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(post.createdAt) }}
                    </span>
                  </div>
                  <p class="text-gray-700">{{ post.content }}</p>
                </div>

                <div v-if="canEditPost(post)" class="flex space-x-1 ml-4">
                  <button
                    @click="startEdit(post)"
                    class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                  >
                    編集
                  </button>
                  <button
                    @click="deletePost(post.id)"
                    :disabled="deleting"
                    class="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="pagination.totalPages > 1"
          class="mt-6 flex justify-center space-x-2"
        >
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            @click="fetchPosts(page)"
            :class="[
              'px-3 py-1 rounded text-sm',
              pagination.currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Post {
  id: number;
  content: string;
  userId?: number;
  user?: { name: string };
  createdAt: string;
  updatedAt: string;
}

interface PostsResponse {
  success: boolean;
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

const posts = ref<Post[]>([]);
const newPostContent = ref<string>("");
const isAnonymous = ref<boolean>(false);
const loading = ref<boolean>(false);
const creating = ref<boolean>(false);
const updating = ref<boolean>(false);
const deleting = ref<boolean>(false);
const error = ref<string>("");
const editingPost = ref<Post | null>(null);
const editContent = ref<string>("");
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  hasMore: false,
});

const currentUserId = ref<number | null>(1);

const fetchPosts = async (page: number = 1) => {
  loading.value = true;
  error.value = "";

  try {
    const response = await $fetch<PostsResponse>(`/api/posts?page=${page}`);

    if (response.success) {
      posts.value = response.posts;
      pagination.value = response.pagination;
    } else {
      error.value = "投稿の取得に失敗しました";
    }
  } catch (err) {
    error.value = "投稿の取得に失敗しました";
    console.error("投稿取得エラー:", err);
  } finally {
    loading.value = false;
  }
};

const createPost = async () => {
  if (!newPostContent.value.trim()) return;

  creating.value = true;
  error.value = "";

  try {
    const response = await $fetch("/api/posts", {
      method: "POST",
      body: {
        content: newPostContent.value,
        userId: isAnonymous.value ? null : currentUserId.value,
      },
    });

    if (response.success) {
      newPostContent.value = "";
      isAnonymous.value = false;
      await fetchPosts();
    }
  } catch (err) {
    error.value = "投稿の作成に失敗しました";
    console.error("投稿作成エラー:", err);
  } finally {
    creating.value = false;
  }
};

const startEdit = (post: Post) => {
  editingPost.value = post;
  editContent.value = post.content;
};

const cancelEdit = () => {
  editingPost.value = null;
  editContent.value = "";
};

const updatePost = async () => {
  if (!editingPost.value || !editContent.value.trim()) return;

  updating.value = true;
  error.value = "";

  try {
    const response = await $fetch(`/api/posts/${editingPost.value.id}`, {
      method: "PUT",
      body: {
        content: editContent.value,
        userId: currentUserId.value,
      },
    });

    if (response.success) {
      cancelEdit();
      await fetchPosts(pagination.value.currentPage);
    }
  } catch (err) {
    error.value = "投稿の更新に失敗しました";
    console.error("投稿更新エラー:", err);
  } finally {
    updating.value = false;
  }
};

const deletePost = async (postId: number) => {
  if (!confirm("この投稿を削除しますか？")) return;

  deleting.value = true;
  error.value = "";

  try {
    const response = await $fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      body: {
        userId: currentUserId.value,
      },
    });

    if (response.success) {
      await fetchPosts(pagination.value.currentPage);
    }
  } catch (err) {
    error.value = "投稿の削除に失敗しました";
    console.error("投稿削除エラー:", err);
  } finally {
    deleting.value = false;
  }
};

const canEditPost = (post: Post): boolean => {
  return post.userId === currentUserId.value;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP");
};

onMounted(() => {
  fetchPosts();
});
</script>
