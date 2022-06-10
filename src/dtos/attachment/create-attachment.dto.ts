import { Exclude, Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

import { BaseDto } from '../baste.dto'
import {
  ContentTypeEnum,
  FileExtensionEnum,
  ParentEnum,
} from './attachment.enum'

@Exclude()
export class CreateUserImageRequest extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly fileExtension: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly parentType: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly filename: string
}

export interface CreateAttachment {
  postOrProfileId: string
  contentType: ContentTypeEnum
  ext: FileExtensionEnum
  parentType: ParentEnum
  filename: string
}
