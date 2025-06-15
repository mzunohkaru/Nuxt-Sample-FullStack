import { prisma } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userId } = body

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid post ID'
      })
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) }
    })

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    if (existingPost.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own posts'
      })
    }

    await prisma.post.delete({
      where: { id: Number(id) }
    })

    return {
      success: true,
      message: 'Post deleted successfully'
    }
  } catch (error) {
    console.error('Failed to delete post:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete post'
    })
  }
})