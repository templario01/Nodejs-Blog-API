import { randAlphaNumeric, randGitShortSha } from '@ngneat/falso'

export function randToken() {
  return randAlphaNumeric({ length: 50 })
    .map((e) => String(e))
    .join()
}

export function randCode() {
  return randGitShortSha().toUpperCase().slice(1)
}
