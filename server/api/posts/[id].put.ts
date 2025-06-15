import { prisma } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { content, userId } = body

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid post ID'
      })
    }

    if (!content || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content is required'
      })
    }

    if (content.length > 120) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content must be 120 characters or less'
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
        statusMessage: 'You can only edit your own posts'
      })
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        content: content.trim()
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return {
      success: true,
      post: updatedPost
    }
  } catch (error) {
    console.error('Failed to update post:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update post'
    })
  }
})