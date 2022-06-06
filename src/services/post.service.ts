import { Post, PostStatus } from '@prisma/client'
import { CreatePostRequest } from '../dtos/post/request/create-post.dto'
import { UpdatePostRequest } from '../dtos/post/request/update-post.dto'
import { prisma } from '../prisma'
import { Paginated } from '../utils/paginated'

export class PostService {
  static createPost(post: CreatePostRequest, userId: string): Promise<Post> {
    return prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        status: post.postStatus,
        userId,
      },
    })
  }

  static updatePost(post: UpdatePostRequest, postId: string): Promise<Post> {
    return prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: post.postStatus,
        title: post.title,
        content: post.content,
      },
    })
  }

  static changeToDeleted(postId: string): Promise<Post> {
    return prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: PostStatus.DELETED,
      },
    })
  }

  static getPostsByUser(userId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: {
        userId,
        status: PostStatus.PUBLISHED,
      },
    })
  }

  static async getAllPosts(
    take = 10,
    pageNumber = 1,
  ): Promise<Paginated<Post>> {
    const totalCount = await prisma.post.count({
      where: {
        status: PostStatus.PUBLISHED,
      },
    })
    const skip = take * (pageNumber - 1)
    const totalPages = Math.ceil(totalCount / take)
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      skip,
      take,
    })
    return {
      info: {
        totalItems: totalCount,
        pages: totalPages,
        currentPage: pageNumber,
        itemsPerPage: take,
      },
      data: posts,
    }
  }

  static getPostById(postId: string): Promise<Post> {
    return prisma.post.findUnique({
      where: {
        id: postId,
      },
    })
  }
}
