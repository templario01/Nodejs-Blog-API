import { Exclude, Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import {
  ContentTypeEnum,
  FileExtensionEnum,
  ParentEnum,
} from './attachment.enum'

@Exclude()
export class UpdateUserImageRequest {
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
