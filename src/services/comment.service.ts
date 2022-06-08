import { Comment, PostStatus, Prisma } from '@prisma/client'
import { Unauthorized } from 'http-errors'
import { CreateCommentRequest } from '../dtos/comment/request/create-coment.dto'
import { UpdateCommentRequest } from '../dtos/comment/request/update-comment.dto'
import { prisma } from '../prisma'
import { Paginated } from '../utils/paginated'

export class CommentService {
  static createComment(
    params: CreateCommentRequest,
    userId: string,
    postId: string,
  ): Promise<Comment> {
    const { commentStatus, content } = params
    return prisma.comment.create({
      data: {
        status: commentStatus,
        content,
        userId,
        postId,
      },
    })
  }

  static getCommentsByUser(userId: string) {
    return prisma.comment.findMany({
      where: { userId },
    })
  }

  static async updateComment(
    params: UpdateCommentRequest,
    commentId: string,
    userId: string,
  ) {
    const userComments = (
      await prisma.comment.findMany({ where: { userId } })
    ).map((comment) => comment.id)
    if (!userComments.includes(commentId)) {
      throw new Unauthorized(`Comment id:${commentId} is not yours`)
    }
    const { commentStatus, content } = params
    return prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        status: commentStatus,
        content,
      },
    })
  }

  static async changeToDeleted(
    commentId: string,
    userId: string,
  ): Promise<Comment> {
    const userComments = (
      await prisma.comment.findMany({ where: { userId } })
    ).map((comment) => comment.id)
    if (!userComments.includes(commentId)) {
      throw new Unauthorized(`Comment id:${commentId} is not yours`)
    }
    return prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        status: PostStatus.DELETED,
      },
    })
  }

  static async getAllCommentByPostId(
    postId: string,
    take = 10,
    pageNumber = 1,
  ): Promise<Paginated<Comment>> {
    const where: Prisma.CommentWhereInput = {
      status: PostStatus.PUBLISHED,
      post: {
        status: PostStatus.PUBLISHED,
        id: postId,
      },
    }
    const totalCount = await prisma.comment.count({ where })
    const skip = take * (pageNumber - 1)
    const totalPages = Math.ceil(totalCount / take)
    const comments = await prisma.comment.findMany({ where, skip, take })

    return {
      info: {
        totalItems: totalCount,
        pages: totalPages,
        currentPage: pageNumber,
        itemsPerPage: take,
      },
      data: comments,
    }
  }
}
