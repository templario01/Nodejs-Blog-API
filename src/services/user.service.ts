import bcrypt from 'bcryptjs'
import { AccountStatus, Role, User } from '@prisma/client'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { prisma } from '../prisma'
import { UpdateUserRequest } from '../dtos/user/request/update-account.dto'

export type UserWithRole = User & {
  role: Role[]
}

export class UserService {
  static findUserById(userId: string): Promise<UserWithRole> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
  }

  static findUserByEmail(email: string): Promise<UserWithRole> {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    })
  }

  static async createAccount(params: CreateUserRequest): Promise<User> {
    const { email, firstName, lastName, password } = params
    const encryptPassword = await this.encryptPassword(password)

    return prisma.user.create({
      data: {
        password: encryptPassword,
        email,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
    })
  }

  static async markAsInactive(userId: string): Promise<User> {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: AccountStatus.INACTIVE,
      },
    })
  }

  static updateUser(params: UpdateUserRequest): Promise<User> {
    const { userId } = params
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: params.password,
        profile: {
          update: {
            firstName: params.firstName,
            lastName: params.lastName,
          },
        },
      },
    })
  }

  static findByRefreshToken(refreshToken: string): Promise<User> {
    return prisma.user.findFirst({
      where: {
        refreshToken,
      },
    })
  }

  static setRefreshToken(token: string, userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    })
  }
  static removeRefreshToken(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  static getProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    })
  }

  private static async encryptPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
  }

  static comparePassword(
    password: string,
    savedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, savedPassword)
  }
}
