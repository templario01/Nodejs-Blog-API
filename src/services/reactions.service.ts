import { LikeOnComment, LikeOnPost, User } from '@prisma/client'
import { prisma } from '../prisma'

type Reaction<T> = T & {
  user: User
}
type UserWithLikePost = User & {
  likeToPost: LikeOnPost[]
}
type UserWithLikeComment = User & {
  likeToComment: LikeOnComment[]
}

export class ReactionsService {
  static setLikeToPost(
    userId: string,
    postId: string,
  ): Promise<Reaction<LikeOnPost>> {
    return prisma.likeOnPost.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
      include: {
        user: true,
      },
    })
  }

  static setLikeToComment(
    userId: string,
    commentId: string,
  ): Promise<Reaction<LikeOnComment>> {
    return prisma.likeOnComment.create({
      data: {
        user: { connect: { id: userId } },
        comment: { connect: { id: commentId } },
      },
      include: {
        user: true,
      },
    })
  }

  static setDislikeToPost(
    userId: string,
    postId: string,
  ): Promise<UserWithLikePost> {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        likeToPost: {
          disconnect: {
            postId_userId: { postId, userId },
          },
        },
      },
      include: {
        likeToPost: true,
      },
    })
  }

  static setDislikeToComment(
    userId: string,
    commentId: string,
  ): Promise<UserWithLikeComment> {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        likeToComment: {
          disconnect: {
            userId_commentId: { commentId, userId },
          },
        },
      },
      include: {
        likeToComment: true,
      },
    })
  }
}
