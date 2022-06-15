import {
  AccountStatus,
  PrismaClient,
  Role,
  User,
  UserRole,
} from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding...')
  const roles = await createRoles()
  const testUser = await createTestUser()
  const adminUser = await createAdminUser()
  // eslint-disable-next-line no-console
  console.log({ roles, testUser, adminUser })
}

main()
  // eslint-disable-next-line no-console
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

function createTestUser(): Promise<User> {
  const user = 'test@gmail.com'
  const password = hashSync('test', 10)
  return createUser(user, password, UserRole.USER)
}

function createAdminUser() {
  const user = 'vict.benavente@gmail.com'
  const password = hashSync('admin', 10)
  return createUser(user, password, UserRole.ADMIN)
}

function createRoles(): Promise<Role[]> {
  const roles = [UserRole.USER, UserRole.ADMIN]
  const roleTasks = roles.map(async (role) => {
    return prisma.role.upsert({
      where: { name: role },
      create: { name: role },
      update: { name: role },
    })
  })
  return Promise.all(roleTasks)
}

async function createUser(
  username: string,
  password: string,
  role: UserRole,
): Promise<User> {
  return prisma.user.upsert({
    where: { email: username },
    create: {
      email: username,
      status: AccountStatus.ACTIVE,
      role: { connect: { name: role } },
      password,
    },
    update: { status: AccountStatus.ACTIVE, password },
  })
}
