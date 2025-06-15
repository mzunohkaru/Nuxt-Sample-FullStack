import { prisma } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const totalPosts = await prisma.post.count()
    const totalPages = Math.ceil(totalPosts / limit)

    return {
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore: page < totalPages
      }
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return {
      success: false,
      error: 'Failed to fetch posts'
    }
  }
})