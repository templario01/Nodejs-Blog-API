import {
  randEmail,
  randFirstName,
  randFullName,
  randPassword,
  randUuid,
} from '@ngneat/falso'
import { AccountStatus } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import {
  UnprocessableEntity,
  NotFound,
  BadRequest,
  Unauthorized,
} from 'http-errors'
import { CreateUserRequest } from '../dtos/user/request/create-account.dto'
import { SignInRequest } from '../dtos/user/request/signin-request.dto'
import { emitter } from '../events/mail-emitter'
import { clearDatabase, prisma } from '../prisma'
import { AuthService } from '../services/auth.service'
import { randCode, randToken } from '../utils/rand-values'
import { VerifyAccountRequest } from '../dtos/user/request/verify-account.dto'
import { UserFactory } from './shared/factories/users.factory'

describe('AuthService', () => {
  let userFactory: UserFactory

  beforeAll(() => {
    userFactory = new UserFactory()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('signUp', () => {
    it('should throw an error when its called with email that exist', async () => {
      const { email } = await userFactory.make()
      const data = plainToClass(CreateUserRequest, {
        firstName: randFirstName(),
        lastName: randFullName(),
        password: randPassword(),
        email,
      })

      await expect(AuthService.signUp(data)).rejects.toThrowError(
        new UnprocessableEntity('Email already taken'),
      )
    })

    it('should return user info when its called with valid data', async () => {
      const spyEmitter = jest.spyOn(emitter, 'emit').mockImplementation()
      const data = plainToClass(CreateUserRequest, {
        firstName: randFirstName(),
        lastName: randFullName(),
        email: randEmail(),
        password: randPassword(),
      })

      const result = await AuthService.signUp(data)

      expect(spyEmitter).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty('message', expect.any(String))
      expect(result).toHaveProperty('email', expect.any(String))
    })
  })

  describe('requestVerification', () => {
    it('should throw an error when its called with email that not exist', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        status: AccountStatus.UNVERIFIED,
      })
      const fakeEmail = randEmail()
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: fakeEmail,
      })

      await expect(AuthService.requestVerification(data)).rejects.toThrowError(
        new NotFound(`email: ${fakeEmail} does not exist`),
      )
    })

    it('should throw an error when its called with email already verified', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
      })
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: mockEmail,
      })

      await expect(AuthService.requestVerification(data)).rejects.toThrowError(
        new BadRequest(`email already verified, please Login`),
      )
    })

    it('should throw an error when its called with bad password', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        status: AccountStatus.UNVERIFIED,
      })
      const fakePassword = randPassword()
      const data = plainToClass(SignInRequest, {
        password: fakePassword,
        email: mockEmail,
      })

      await expect(AuthService.requestVerification(data)).rejects.toThrowError(
        new Unauthorized('user or password invalid'),
      )
    })

    it('should return user info when its called with valid data', async () => {
      const spyEmitter = jest.spyOn(emitter, 'emit').mockImplementation()
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        status: AccountStatus.UNVERIFIED,
      })
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: mockEmail,
      })

      const result = await AuthService.requestVerification(data)

      expect(spyEmitter).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty('message', expect.any(String))
      expect(result).toHaveProperty('email', expect.any(String))
    })
  })

  describe('signIn', () => {
    it('should throw an error when its called with email that not exist', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
      })
      const fakeEmail = randEmail()
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: fakeEmail,
      })

      await expect(AuthService.signIn(data)).rejects.toThrowError(
        new NotFound(`email: ${fakeEmail} does not exist`),
      )
    })

    it('should throw an error when its called with unverified email', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        status: AccountStatus.UNVERIFIED,
      })
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: mockEmail,
      })

      await expect(AuthService.signIn(data)).rejects.toThrowError(
        new Unauthorized(`please confirm your email`),
      )
    })

    it('should throw an error when its called with bad password', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
      })
      const fakePassword = randPassword()
      const data = plainToClass(SignInRequest, {
        password: fakePassword,
        email: mockEmail,
      })

      await expect(AuthService.signIn(data)).rejects.toThrowError(
        new Unauthorized('user or password invalid'),
      )
    })

    it('should return session tokens when its called with valid data', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
      })
      const data = plainToClass(SignInRequest, {
        password: mockPassword,
        email: mockEmail,
      })

      const result = await AuthService.signIn(data)

      expect(result).toHaveProperty('access_token', expect.any(String))
      expect(result).toHaveProperty('refresh_token', expect.any(String))
    })
  })

  describe('getNewAccessToken', () => {
    it('should throw an error when its called with bad refresh token', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
      })
      const fakeRefreshToken = randToken()

      await expect(
        AuthService.getNewAccessToken(fakeRefreshToken),
      ).rejects.toThrowError(
        new Unauthorized('Your refresh token have been expired'),
      )
    })

    it('should return session tokens when its called with valid token', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockToken = randToken()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        refreshToken: mockToken,
      })

      const result = await AuthService.getNewAccessToken(mockToken)

      expect(result).toHaveProperty('access_token', expect.any(String))
      expect(result).toHaveProperty('refresh_token', expect.any(String))
    })
  })

  describe('verifyAccount', () => {
    it('should throw an error when its called with bad email', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockCode = randCode()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        status: AccountStatus.UNVERIFIED,
        verificationCode: mockCode,
      })

      const fakeEmail = randEmail()
      const data = plainToClass(VerifyAccountRequest, {
        password: mockPassword,
        email: fakeEmail,
        code: mockCode,
      })

      await expect(AuthService.verifyAccount(data)).rejects.toThrowError(
        new NotFound(`email: ${data.email} does not exist`),
      )
    })

    it('should throw an error when its called with email verified', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockCode = randCode()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        verificationCode: mockCode,
        status: AccountStatus.ACTIVE,
      })

      const data = plainToClass(VerifyAccountRequest, {
        password: mockPassword,
        email: mockEmail,
        code: mockCode,
      })

      await expect(AuthService.verifyAccount(data)).rejects.toThrowError(
        new BadRequest(`email already verified, please Login`),
      )
    })

    it('should throw an error when its called with bad password', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockCode = randCode()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        verificationCode: mockCode,
        status: AccountStatus.UNVERIFIED,
      })

      const fakePassword = randPassword()
      const data = plainToClass(VerifyAccountRequest, {
        password: fakePassword,
        email: mockEmail,
        code: mockCode,
      })

      await expect(AuthService.verifyAccount(data)).rejects.toThrowError(
        new Unauthorized('user or password invalid'),
      )
    })

    it('should throw an error when its called with bad code', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockCode = randCode()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        verificationCode: mockCode,
        status: AccountStatus.UNVERIFIED,
      })

      const fakeCode = randCode()
      const data = plainToClass(VerifyAccountRequest, {
        password: mockPassword,
        email: mockEmail,
        code: fakeCode,
      })

      await expect(AuthService.verifyAccount(data)).rejects.toThrowError(
        new Unauthorized('Invalid verification code'),
      )
    })

    it('should return a verified user when its called with valid data', async () => {
      const mockEmail = randEmail()
      const mockPassword = randPassword()
      const mockCode = randCode()
      await userFactory.make({
        email: mockEmail,
        password: mockPassword,
        verificationCode: mockCode,
        status: AccountStatus.UNVERIFIED,
      })

      const data = plainToClass(VerifyAccountRequest, {
        password: mockPassword,
        email: mockEmail,
        code: mockCode,
      })

      const result = await AuthService.verifyAccount(data)

      expect(result).not.toBeNull()
      expect(result.status).toBe(AccountStatus.ACTIVE)
    })
  })

  describe('logOut', () => {
    it('should throw an error when userId is invalid', async () => {
      const fakeId = randUuid()
      await userFactory.make()

      await expect(AuthService.logOut(fakeId)).rejects.toThrowError(
        new NotFound(`User with id: ${fakeId} does not exist`),
      )
    })

    it('should return true with valid userId', async () => {
      const { id } = await userFactory.make()

      const result = await AuthService.logOut(id)

      expect(result).toBe(true)
    })
  })
})
