import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

import { BaseDto } from '../baste.dto'
import {
  ContentTypeEnum,
  FileExtensionEnum,
  ParentEnum,
} from './attachment.enum'

@Exclude()
export class CreateUserImageRequest extends BaseDto {
  @Expose()
  @IsEnum(() => ContentTypeEnum, {
    message: 'Supported values: PNG or JPG or JPEG',
  })
  @IsNotEmpty()
  readonly contentType: ContentTypeEnum

  @Expose()
  @IsEnum(() => FileExtensionEnum, {
    message: 'Supported values: PNG or JPG or JPEG',
  })
  @IsNotEmpty()
  readonly ext: FileExtensionEnum

  @Expose()
  @IsEnum(() => ParentEnum, {
    message: 'Supported values: USER or POST',
  })
  @IsNotEmpty()
  readonly parentType: ParentEnum

  @Expose()
  @IsString()
  readonly filename: string
}

export interface CreateAttachment {
  postOrProfileId: string
  contentType: ContentTypeEnum
  ext: FileExtensionEnum
  parentType: ParentEnum
  filename: string
}
