import { randPhrase, randText, randUuid } from '@ngneat/falso'
import { PostStatus } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { BadRequest } from 'http-errors'
import { CreatePostRequest } from '../dtos/post/request/create-post.dto'
import { UpdatePostRequest } from '../dtos/post/request/update-post.dto'
import { clearDatabase, prisma } from '../prisma'
import { PostService } from '../services/post.service'
import { PostFactory } from './shared/factories/PostFactory'
import { UserFactory } from './shared/factories/users.factory'

describe('PostService', () => {
  let postFactory: PostFactory
  let userFactory: UserFactory

  beforeAll(() => {
    postFactory = new PostFactory()
    userFactory = new UserFactory()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('createPost', () => {
    it('should throw an error when its called with bad userId', async () => {
      const data = plainToClass(CreatePostRequest, {
        title: randPhrase(),
        content: randText(),
        postStatus: PostStatus.PUBLISHED,
      })
      const fakeUserId = randUuid()

      await expect(
        PostService.createPost(data, fakeUserId),
      ).rejects.toThrowError(new BadRequest(`Invalid userId: ${fakeUserId}`))
    })

    it('should create a PUBLISHED post with valid data', async () => {
      const { id } = await userFactory.make()
      const data = plainToClass(CreatePostRequest, {
        title: randPhrase(),
        content: randText(),
        postStatus: PostStatus.PUBLISHED,
      })

      const result = await PostService.createPost(data, id)
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('id', expect.any(String))
      expect(result.status).toBe('PUBLISHED')
    })

    it('should create a DRAFT post with valid data', async () => {
      const { id } = await userFactory.make()
      const data = plainToClass(CreatePostRequest, {
        title: randPhrase(),
        content: randText(),
        postStatus: PostStatus.DRAFT,
      })

      const result = await PostService.createPost(data, id)
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('id', expect.any(String))
      expect(result.status).toBe('DRAFT')
    })
  })

  describe('updatePost', () => {
    it('should throw an error when its called with bad postId', async () => {
      const { id } = await userFactory.make()
      await postFactory.make(id)

      const data = plainToClass(UpdatePostRequest, {
        title: randPhrase(),
        content: randText(),
        postStatus: PostStatus.PUBLISHED,
      })
      const fakePostId = randUuid()

      await expect(
        PostService.updatePost(data, fakePostId),
      ).rejects.toThrowError(new BadRequest(`Invalid postId: ${fakePostId}`))
    })

    it('should update correct fields with valid data', async () => {
      const { id } = await userFactory.make()
      const post = await postFactory.make(id)

      const data = plainToClass(UpdatePostRequest, {
        content: randText(),
        postStatus: PostStatus.DRAFT,
      })

      const result = await PostService.updatePost(data, post.id)
      expect(result.content).toBe(data.content)
      expect(result.title).toBe(post.title)
    })
  })
})
