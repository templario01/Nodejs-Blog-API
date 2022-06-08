import fs from 'fs'
import { load } from 'js-yaml'
import { JsonObject } from 'swagger-ui-express'

export const documentation = load(
  fs.readFileSync('./docs/apidoc.yaml', 'utf-8'),
) as JsonObject
