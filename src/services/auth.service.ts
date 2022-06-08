import jwt from 'jsonwebtoken'
import {
  NotFound,
  Unauthorized,
  UnprocessableEntity,
  BadRequest,
} from 'http-errors'
import { AccountStatus } from '@prisma/client'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { SignInRequest } from '../dtos/user/request/signin-request.dto'
import { AccessTokenResponse } from '../dtos/user/response/access-token.response'
import { verifyEmail } from '../dtos/user/response/create-account.response'
import { emitter } from '../events/mail-emitter'
import { mailBody } from '../events/mail.request'
import { UserService } from './user.service'

export class AuthService {
  static async signUp(params: CreateUserRequest): Promise<verifyEmail> {
    const user = await UserService.findUserByEmail(params.email)
    if (user) {
      throw new UnprocessableEntity('Email already taken')
    }
    const { createdAt, email } = await UserService.createAccount(params)
    const mailNotification: mailBody = { email }
    emitter.emit('notify-mail', mailNotification)

    return {
      sentDate: createdAt,
      email: email,
      expirationTime: '3 hours',
      message: 'Please verify your account in your email',
    }
  }

  static async requestVerification(
    params: SignInRequest,
  ): Promise<verifyEmail> {
    const { email, password } = params
    const user = await UserService.findUserByEmail(email)
    if (!user) {
      throw new NotFound(`email: ${email} does not exist`)
    }
    if (user.status !== AccountStatus.UNVERIFIED) {
      throw new BadRequest(`email already verified, please Login`)
    }
    const matchPassword = await UserService.comparePassword(
      password,
      user.password,
    )
    if (!matchPassword) {
      throw new Unauthorized('user or password invalid')
    }
    const { updateAt } = await UserService.resendCode(user.id)
    const mailNotification: mailBody = { email }
    emitter.emit('notify-mail', mailNotification)

    return {
      sentDate: updateAt,
      email: email,
      expirationTime: '3 hours',
      message: 'Please verify your account in your email',
    }
  }

  static async signIn(params: SignInRequest): Promise<AccessTokenResponse> {
    const { email, password } = params
    const user = await UserService.findUserByEmail(email)
    if (!user) {
      throw new NotFound(`email: ${email} does not exist`)
    }
    if (user.status !== AccountStatus.ACTIVE) {
      throw new Unauthorized(`please confirm your email`)
    }
    const matchPassword = await UserService.comparePassword(
      password,
      user.password,
    )
    if (!matchPassword) {
      throw new Unauthorized('user or password invalid')
    }
    const refreshToken = this.generateToken(7200, user.id)
    const accessToken = this.generateToken(1800, user.id)
    await UserService.setRefreshToken(user.id, refreshToken)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  static async getNewAccessToken(
    refreshToken: string,
  ): Promise<AccessTokenResponse> {
    const user = await UserService.findByRefreshToken(refreshToken)
    if (!user?.refreshToken) {
      throw new Unauthorized('Your refresh token have been expired')
    }
    const newRefreshToken = this.generateToken(7200, user.id)
    const accessToken = this.generateToken(1800, user.id)
    await UserService.setRefreshToken(user.id, newRefreshToken)

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    }
  }

  static async logOut(userId: string): Promise<boolean> {
    const removeToken = await UserService.removeRefreshToken(userId)
    return !!removeToken
  }

  static generateToken(time: number, userId: string) {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY as string, {
      expiresIn: time,
    })
  }
}
