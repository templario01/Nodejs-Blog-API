import { CommentReport, PostReport, ReportReason } from '@prisma/client'
import { prisma } from '../prisma'

export class ReportService {
  static reportPost(
    postId: string,
    userId: string,
    reportMotive: ReportReason,
  ): Promise<PostReport> {
    return prisma.postReport.create({
      data: {
        reason: reportMotive,
        user: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
      },
    })
  }

  static reportComment(
    commentId: string,
    userId: string,
    reportMotive: ReportReason,
  ): Promise<CommentReport> {
    return prisma.commentReport.create({
      data: {
        reason: reportMotive,
        user: {
          connect: {
            id: userId,
          },
        },
        comment: {
          connect: {
            id: commentId,
          },
        },
      },
    })
  }
}
