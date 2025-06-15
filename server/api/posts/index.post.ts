import { prisma } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { content, userId } = body

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

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId: userId || null
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
      post
    }
  } catch (error) {
    console.error('Failed to create post:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post'
    })
  }
})