import { UserService } from '../services/user.service'

export const resetVerificationCodes = async () => {
  const resetCodes = await UserService.resetVerifyCodeOfAccounts()
  // eslint-disable-next-line no-console
  console.log(
    `[Cron] The verification codes of ${resetCodes.count} accounts was reseted`,
  )
}
