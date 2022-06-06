import { UnprocessableEntity } from 'http-errors'
import bcrypt from 'bcryptjs'
import { AccountStatus, User } from '@prisma/client'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { prisma } from '../prisma'
import { UpdateUserRequest } from '../dtos/user/request/update-account.dto'

export class UserService {
  static async createAccount(params: CreateUserRequest): Promise<User> {
    const { email, firstName, lastName, password } = params
    const findUser = await prisma.user.findFirst({
      where: { email: params.email },
    })
    if (findUser) {
      throw new UnprocessableEntity('Email already taken')
    }
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

  private static async encryptPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
  }
}
