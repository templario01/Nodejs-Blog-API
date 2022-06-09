import { Bucket, GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { Cors } from '@google-cloud/storage/build/src/storage'
import { randEthereumAddress } from '@ngneat/falso'
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

export class AtachmentService {
  private readonly storage: Storage
  private bucket: Bucket
  constructor() {
    this.storage = new Storage({
      credentials: {
        client_email: process.env.GS_SERVICE_ACCOUNT,
        private_key: process.env.GS_PRIVATE_KEY,
      },
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    })
    this.bucket = this.storage.bucket(process.env.GS_AVATAR_BUCKET as string)
    this.bucket.setCorsConfiguration([corsCfg])
  }

  async createAttachment(input: CreateAttachment) {
    const signedUploadCfg: GetSignedUrlConfig = {
      contentType: input.contentType,
      action: 'write',
      version: 'v4',
      expires: Date.now() + 15 * 60 * 1000,
    }
    const path = AttachmentDirectoryEnum[input.parentType].toString()
    const nanoId = randEthereumAddress()
    const sigendURL = (
      await this.bucket
        .file(`${path}/${nanoId}-${input.filename}.${input.ext}`)
        .getSignedUrl(signedUploadCfg)
    ).toString()

    const image = await prisma.attachment.create({
      data: {
        contentType: input.contentType,
        keyname: `${nanoId}-${input.filename}`,
        ext: input.ext,
        path,
        postId:
          input.parentType === ParentEnum.POST ? input.postOrProfileId : null,
        profileId:
          input.parentType === ParentEnum.USER ? input.postOrProfileId : null,
      },
    })

    return {
      ...image,
      signedUrl: sigendURL,
    }
  }

  async finndImageById(imageId: number) {
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
}

// http://storage.googleapis.com/BUCKET_NAME/OBJECT_NAME
