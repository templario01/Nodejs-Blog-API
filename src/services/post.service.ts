import { Post, PostStatus } from '@prisma/client'
import { CreatePostRequest } from '../dtos/post/request/create-post.dto'
import { UpdatePostRequest } from '../dtos/post/request/update-post.dto'
import { prisma } from '../prisma'

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
        status: {
          not: {
            in: [PostStatus.DELETED, PostStatus.DRAFT],
          },
        },
      },
    })
  }

  static getAllPosts(): Promise<Post[]> {
    return prisma.post.findMany({
      where: {
        status: {
          not: {
            in: [PostStatus.DELETED, PostStatus.DRAFT],
          },
        },
      },
    })
  }

  static getPostById(postId: string): Promise<Post> {
    return prisma.post.findUnique({
      where: {
        id: postId,
      },
    })
  }
}
