import jwt from 'jsonwebtoken'
import {
  NotFound,
  Unauthorized,
  UnprocessableEntity,
  BadRequest,
} from 'http-errors'
import { AccountStatus, User } from '@prisma/client'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { SignInRequest } from '../dtos/user/request/signin-request.dto'
import { AccessTokenResponse } from '../dtos/user/response/access-token.response'
import { verifyEmail } from '../dtos/user/response/create-account.response'
import { emitter } from '../events/mail-emitter'
import { mailBody } from '../events/mail.request'
import { generateEmailBody } from '../utils/mail.template'
import { VerifyAccountRequest } from '../dtos/user/request/verify-account.dto'
import { UserService } from './user.service'

export class AuthService {
  static async signUp(params: CreateUserRequest): Promise<verifyEmail> {
    const user = await UserService.findUserByEmail(params.email)
    if (user) {
      throw new UnprocessableEntity('Email already taken')
    }
    const { createdAt, email, verificationCode, profile } =
      await UserService.createAccount(params)
    const htmlBody = generateEmailBody(
      verificationCode as string,
      profile?.firstName as string,
    )
    const mailNotification: mailBody = { email, html: htmlBody }
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

    const { updateAt, verificationCode, profile } =
      await UserService.resendCode(user.id)
    const htmlBody = generateEmailBody(
      verificationCode as string,
      profile?.firstName as string,
    )
    const mailNotification: mailBody = { email, html: htmlBody }
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

  static async verifyAccount(params: VerifyAccountRequest): Promise<User> {
    const { email, password, code } = params
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
    if (user.verificationCode !== code) {
      throw new Unauthorized('Invalid verification code')
    }
    return UserService.verifyAccount(user.id)
  }

  static async logOut(userId: string): Promise<boolean> {
    const user = await UserService.findUserById(userId)
    if (!user) {
      throw new NotFound(`User with id: ${userId} does not exist`)
    }
    const removeToken = await UserService.removeRefreshToken(userId)
    return !!removeToken
  }

  private static generateToken(time: number, userId: string) {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY as string, {
      expiresIn: time,
    })
  }
}
