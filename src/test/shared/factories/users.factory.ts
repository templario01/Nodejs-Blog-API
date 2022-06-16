import { AccountStatus, Prisma, User, UserRole } from '@prisma/client'
import {
  randEmail,
  randFirstName,
  randLastName,
  randPassword,
} from '@ngneat/falso'
import { hashSync } from 'bcryptjs'
import { prisma } from '../../../prisma'
import { randCode, randToken } from '../../../utils/rand-values'
import { AbstractFactory } from './abstract.factory'

export type UserInput = Partial<Prisma.UserCreateInput> & {
  firstName?: string
  lastName?: string
}

export class UserFactory extends AbstractFactory<UserInput> {
  async make(input: UserInput = {}): Promise<User> {
    const username = randEmail()
    return prisma.user.create({
      data: {
        email: input.email || username,
        password: hashSync(input.password || randPassword(), 10),
        status: input.status || AccountStatus.ACTIVE,
        refreshToken: input.refreshToken || randToken(),
        verificationCode: input.verificationCode || randCode(),
        profile: {
          create: {
            firstName: input.firstName || randFirstName(),
            lastName: input.lastName || randLastName(),
          },
        },
        role: {
          connect: {
            name: UserRole.USER,
          },
        },
      },
    })
  }
  async makeMany(factorial: number, input: UserInput = {}) {
    return Promise.all([...Array(factorial)].map(() => this.make(input)))
  }
}
