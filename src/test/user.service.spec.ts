import { clearDatabase, prisma } from '../prisma'
import { UserService } from '../services/user.service'
import { UserFactory } from './shared/factories/users.factory'

describe('UserService', () => {
  let userFactory: UserFactory

  beforeAll(() => {
    userFactory = new UserFactory()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('findUserById', () => {
    it('should return an user with valid userId', async () => {
      const user = await userFactory.make()
      const result = await UserService.findUserById(user.id)

      expect(result).not.toBeNull()
      expect(result).toHaveProperty('id', expect.any(String))
      expect(result).toHaveProperty('createdAt', expect.any(Date))
    })
  })
})
