import { Reaction, ReactionType, Source } from '@prisma/client'
import { prisma } from '../prisma'

export class ReactionsService {
  static async setLikeToPost(
    userId: string,
    postId: string,
  ): Promise<Reaction> {
    const setLike = await prisma.reaction.upsert({
      where: {
        userId_postOrCommentId: {
          postOrCommentId: postId,
          userId,
        },
      },
      update: {
        reactionType: ReactionType.LIKE,
      },
      create: {
        postOrCommentId: postId,
        reactionType: ReactionType.LIKE,
        source: Source.POST,
        userId,
      },
    })
    await this.incrementLikesOnPost(postId)
    return setLike
  }

  static async setDislikeToPost(
    userId: string,
    postId: string,
  ): Promise<Reaction> {
    const setLike = await prisma.reaction.upsert({
      where: {
        userId_postOrCommentId: {
          postOrCommentId: postId,
          userId,
        },
      },
      update: {
        reactionType: ReactionType.DISLIKE,
      },
      create: {
        postOrCommentId: postId,
        reactionType: ReactionType.DISLIKE,
        source: Source.POST,
        userId,
      },
    })
    await this.incrementDislikesOnPost(postId)
    return setLike
  }

  static async incrementLikesOnPost(postId: string): Promise<void> {
    const { totalDislikes, totalLikes } = await prisma.post.findUnique({
      where: { id: postId },
      select: { totalLikes: true, totalDislikes: true },
    })

    prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        totalLikes: totalLikes + 1,
        totalDislikes: totalDislikes > 0 ? totalDislikes - 1 : 0,
      },
    })
  }

  static async incrementDislikesOnPost(postId: string): Promise<void> {
    const { totalDislikes, totalLikes } = await prisma.post.findUnique({
      where: { id: postId },
      select: { totalLikes: true, totalDislikes: true },
    })

    prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        totalDislikes: totalDislikes + 1,
        totalLikes: totalLikes > 0 ? totalLikes - 1 : 0,
      },
    })
  }

  static async setLikeToComment(
    userId: string,
    commentId: string,
  ): Promise<Reaction> {
    const setLike = await prisma.reaction.upsert({
      where: {
        userId_postOrCommentId: {
          postOrCommentId: commentId,
          userId,
        },
      },
      update: {
        reactionType: ReactionType.LIKE,
      },
      create: {
        postOrCommentId: commentId,
        reactionType: ReactionType.LIKE,
        source: Source.COMMENT,
        userId,
      },
    })
    await this.incrementLikesOnComment(commentId)
    return setLike
  }

  static async setDislikeToComment(
    userId: string,
    commentId: string,
  ): Promise<Reaction> {
    const setLike = await prisma.reaction.upsert({
      where: {
        userId_postOrCommentId: {
          postOrCommentId: commentId,
          userId,
        },
      },
      update: {
        reactionType: ReactionType.DISLIKE,
      },
      create: {
        postOrCommentId: commentId,
        reactionType: ReactionType.DISLIKE,
        source: Source.COMMENT,
        userId,
      },
    })
    await this.incrementDislikesOnComment(commentId)
    return setLike
  }

  static async incrementLikesOnComment(commentId: string): Promise<void> {
    const { totalDislikes, totalLikes } = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { totalLikes: true, totalDislikes: true },
    })

    prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        totalLikes: totalLikes + 1,
        totalDislikes: totalDislikes > 0 ? totalDislikes - 1 : 0,
      },
    })
  }

  static async incrementDislikesOnComment(commentId: string): Promise<void> {
    const { totalDislikes, totalLikes } = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { totalLikes: true, totalDislikes: true },
    })

    prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        totalDislikes: totalDislikes + 1,
        totalLikes: totalLikes > 0 ? totalLikes - 1 : 0,
      },
    })
  }
}
