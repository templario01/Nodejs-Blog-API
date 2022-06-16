import { randPhrase, randText } from '@ngneat/falso'
import { Post, PostStatus, Prisma } from '@prisma/client'
import { prisma } from '../../../prisma'
import { AbstractFactory } from './abstract.factory'

export type PostInput = Partial<Prisma.PostCreateInput>

export class PostFactory extends AbstractFactory<PostInput> {
  make(userId: string, input: PostInput = {}): Promise<Post> {
    return prisma.post.create({
      data: {
        content: input.content || randText(),
        title: input.title || randPhrase(),
        status: input.status || PostStatus.PUBLISHED,
        author: { connect: { id: userId } },
      },
    })
  }
  makeMany(
    factorial: number,
    userId: string,
    input: PostInput = {},
  ): Promise<Post[]> {
    return Promise.all(
      [...Array(factorial)].map(() => this.make(userId, input)),
    )
  }
}
