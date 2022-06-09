import { ParentEnum } from '../attachment.enum'

export class AttachmentResponse {
  id: number
  parentId?: string
  parentType: ParentEnum
  uuid: string
  path: string
  keyname: string
  ext: string
  contentType: string
  signedUrl: string
  createdAt: Date
}
