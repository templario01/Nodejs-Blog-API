import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { Cors } from '@google-cloud/storage/build/src/storage'
import { randUuid } from '@ngneat/falso'
import { Attachment } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import {
  AttachmentDirectoryEnum,
  ParentEnum,
} from '../dtos/attachment/attachment.enum'
import { CreateAttachment } from '../dtos/attachment/create-attachment.dto'
import { AttachmentResponse } from '../dtos/attachment/response/attachment.response'
import { prisma } from '../prisma'

const corsCfg: Cors = {
  method: ['PUT', 'GET', 'POST'],
  origin: ['*'],
  responseHeader: ['Content-Type'],
}

const storage = new Storage({
  credentials: {
    client_email: process.env.GS_SERVICE_ACCOUNT,
    private_key: String(process.env.GS_PRIVATE_KEY)
      .replace('"', '')
      .replace(/\\n/gm, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
})

const bucket = storage.bucket(process.env.GS_AVATAR_BUCKET as string)
bucket.setCorsConfiguration([corsCfg])

export class AtachmentService {
  static async createAttachment(input: CreateAttachment) {
    const signedUploadCfg = {
      contentType: input.contentType,
      action: 'write',
      version: 'v4',
      expires: Date.now() + 15 * 60 * 1000,
    }
    const path = AttachmentDirectoryEnum[input.parentType].toString()
    const nanoId = randUuid()
    const signedURL = await bucket
      .file(`${path}/${nanoId}-${input.filename}.${input.ext}`)
      .getSignedUrl(signedUploadCfg as GetSignedUrlConfig)

    const image = await prisma.attachment.create({
      data: {
        contentType: input.contentType as string,
        keyname: `${nanoId}-${input.filename}`,
        ext: input.ext as string,
        path,
        postId:
          input.parentType === ParentEnum.POST ? input.postOrProfileId : null,
        profileId:
          input.parentType === ParentEnum.USER ? input.postOrProfileId : null,
      },
    })

    return {
      ...image,
      signedUrl: signedURL.toString(),
    }
  }

  static async findByProfile(profileId: string): Promise<Attachment | null> {
    return prisma.attachment.findFirst({
      where: {
        profileId,
      },
      rejectOnNotFound: false,
    })
  }

  static async finndImageById(imageId: number) {
    const image = await prisma.attachment.findUnique({
      where: {
        id: imageId,
      },
      include: {
        postImage: true,
        profileImage: true,
      },
    })

    const parentType = image.path.includes('profile')
      ? ParentEnum.USER
      : ParentEnum.POST

    const parentId = image.profileImage?.id || image.postImage?.id
    const url = `https://storage.googleapis.com/blog-api-avatars/${image.path}/${image.keyname}.${image.ext}`

    return plainToClass(AttachmentResponse, {
      ...image,
      parentId: parentId,
      signedUrl: url,
      parentType: parentType,
    })
  }

  static async find(imageId: number) {
    return prisma.attachment.findUnique({
      where: {
        id: imageId,
      },
    })
  }

  static async updateImageById(input: CreateAttachment, attachmentId: number) {
    const signedUploadCfg = {
      contentType: input.contentType,
      action: 'write',
      version: 'v4',
      expires: Date.now() + 15 * 60 * 1000,
    }
    const path = AttachmentDirectoryEnum[input.parentType].toString()
    const nanoId = randUuid()
    const file = `${path}/${nanoId}-${input.filename}.${input.ext}`
    const signedURL = await bucket
      .file(file)
      .getSignedUrl(signedUploadCfg as GetSignedUrlConfig)

    const previousImg = await this.find(attachmentId)
    const previousFile = `${previousImg.path}/${previousImg.keyname}.${previousImg.ext}`
    await this.deleteFileInGoogle(previousFile)

    const image = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        contentType: input.contentType,
        keyname: `${nanoId}-${input.filename}`,
        path: path,
        ext: input.ext,
      },
    })

    return {
      ...image,
      signedUrl: signedURL.toString(),
    }
  }

  static deleteFileInGoogle(file: string) {
    return storage
      .bucket(process.env.GS_AVATAR_BUCKET as string)
      .file(file)
      .delete()
  }
}

// http://storage.googleapis.com/BUCKET_NAME/OBJECT_NAME
