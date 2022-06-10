import bcrypt from 'bcryptjs'
import { randGitShortSha } from '@ngneat/falso'
import {
  AccountStatus,
  Post,
  Profile,
  ProfileView,
  Role,
  User,
} from '@prisma/client'
import { BadRequest, NotFound } from 'http-errors'
import { plainToClass } from 'class-transformer'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { prisma } from '../prisma'
import { UpdateUserRequest } from '../dtos/user/request/update-account.dto'
import {
  CreateAttachment,
  CreateUserImageRequest,
} from '../dtos/attachment/create-attachment.dto'
import { AttachmentResponse } from '../dtos/attachment/response/attachment.response'
import { UpdateUserImageRequest } from '../dtos/attachment/update-attachment.dto'
import {
  ContentTypeEnum,
  FileExtensionEnum,
  ParentEnum,
} from '../dtos/attachment/attachment.enum'
import { AtachmentService } from './attachment.service'

export type UserWithRole = User & {
  role: Role[]
}

export type UserWithProfile = {
  email: string
  posts?: Post[]
  profile?: {
    view?: ProfileView
    firstName?: string
    lastName?: string
    createdAt?: Date
  } | null
}

export type UserWithCompleteProfile = User & {
  profile: Profile | null
}

export class UserService {
  static findUserById(userId: string): Promise<UserWithRole> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
  }

  static async findUserWithProfileById(
    userId: string,
  ): Promise<UserWithProfile> {
    const { profile } = await prisma.user.findFirst({
      where: {
        id: userId,
        profile: {
          view: ProfileView.PUBLIC,
        },
      },
      select: {
        profile: {
          select: {
            view: true,
          },
        },
      },
    })
    if (profile?.view == ProfileView.PRIVATE) {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          profile: { select: { view: true } },
        },
      })
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        posts: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
    })
  }

  static findUserByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
      rejectOnNotFound: false,
    })
  }

  static async createAccount(
    params: CreateUserRequest,
  ): Promise<UserWithCompleteProfile> {
    const { email, firstName, lastName, password } = params
    const encryptPassword = await this.encryptPassword(password)
    const code = randGitShortSha().toUpperCase().slice(1)

    return prisma.user.create({
      data: {
        verificationCode: code,
        password: encryptPassword,
        email,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: { profile: true },
    })
  }

  static async markAsInactive(userId: string): Promise<User> {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: AccountStatus.INACTIVE,
        updateAt: new Date(),
      },
    })
  }

  static updateUser(params: UpdateUserRequest, userId: string): Promise<User> {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: params.password,
        updateAt: new Date(),
        profile: {
          update: {
            view: params.view,
            firstName: params.firstName,
            lastName: params.lastName,
            updateAt: new Date(),
          },
        },
      },
    })
  }

  static findByRefreshToken(refreshToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        refreshToken,
      },
      rejectOnNotFound: false,
    })
  }

  static setRefreshToken(userId: string, token: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token, updateAt: new Date() },
    })
  }
  static removeRefreshToken(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, updateAt: new Date() },
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

  static resetVerifyCodeOfAccounts() {
    return prisma.user.updateMany({
      where: {
        status: AccountStatus.UNVERIFIED,
      },
      data: {
        verificationCode: null,
        updateAt: new Date(),
      },
    })
  }

  static resendCode(userId: string): Promise<UserWithCompleteProfile> {
    const code = randGitShortSha().toUpperCase().slice(1)
    return prisma.user.update({
      where: { id: userId },
      data: { verificationCode: code, updateAt: new Date() },
      include: { profile: true },
    })
  }

  static verifyAccount(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.ACTIVE, updateAt: new Date() },
    })
  }

  static async saveProfileImage(
    request: CreateUserImageRequest,
    userId: string,
  ) {
    this.validateFileAndParent(request)
    const { id } = await prisma.profile.findUnique({
      where: { userId },
    })

    const haveImage = await AtachmentService.findByProfile(id)

    if (haveImage) {
      throw new BadRequest(`user already have profile image`)
    }
    const attachment = this.attachmentRequest(request, id)
    const setImage = await AtachmentService.createAttachment(attachment)

    return plainToClass(AttachmentResponse, {
      ...setImage,
      parentId: userId,
    })
  }

  static async updateProfileImage(
    request: UpdateUserImageRequest,
    userId: string,
  ) {
    this.validateFileAndParent(request)
    const { id } = await prisma.profile.findUnique({
      where: { userId },
    })
    const findImage = await AtachmentService.findByProfile(id)
    if (!findImage) {
      throw new NotFound(`image not found, please set an image`)
    }
    const attachment = this.attachmentRequest(request, id)

    return AtachmentService.updateImageById(attachment, findImage.id)
  }

  private static validateFileAndParent(request: UpdateUserImageRequest): void {
    const { fileExtension, parentType } = request
    if (
      fileExtension !== 'PNG' &&
      fileExtension !== 'JPG' &&
      fileExtension !== 'JPEG'
    ) {
      throw new BadRequest('extensions supported: PNG, JPG or JPEG')
    }
    if (parentType !== 'USER' && parentType !== 'POST') {
      throw new BadRequest('parent type must be USER or POST')
    }
  }

  private static attachmentRequest(
    request: UpdateUserImageRequest,
    profileId: string,
  ): CreateAttachment {
    const { fileExtension, parentType } = request
    return {
      contentType:
        fileExtension === 'PNG'
          ? ContentTypeEnum.PNG
          : fileExtension === 'JPG'
          ? ContentTypeEnum.JPG
          : ContentTypeEnum.JPEG,
      ext:
        fileExtension === 'PNG'
          ? FileExtensionEnum.PNG
          : fileExtension === 'JPG'
          ? FileExtensionEnum.JPG
          : FileExtensionEnum.JPEG,
      filename: request.filename,
      parentType: parentType === 'USER' ? ParentEnum.USER : ParentEnum.POST,
      postOrProfileId: profileId,
    }
  }
}
