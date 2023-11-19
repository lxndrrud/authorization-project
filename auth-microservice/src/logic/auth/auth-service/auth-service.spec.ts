import { AuthService } from './auth-service';
import { User } from '../../../databases/Sequelize/models/User.model';
import { createStubInstance } from 'sinon';
import { Hasher } from '../../../shared/utils/hasher/hasher';
import { UsersRepo } from '../users-repo/users-repo';
import { JwtHelper } from '../../../shared/utils/jwt-helper/jwt-helper';
import { RegisterUserDto } from '../dto/RegisterUser.dto';
import { InvalidRequestError } from '../../../shared/errors/InvalidRequestError';
import { InternalError } from '../../../shared/errors/InternalError';
import { LoginUserRequestDto } from '../dto/LoginUserRequest.dto';
import { RedisSessionRepo } from '../sessions-repo/sessions-repo';
import { TSessionModel } from '../types/SessionModel.type';
import { RemoveSessionRequestDto } from '../dto/RemoveSessionRequest.dto';

describe('AuthService', () => {
  describe('Register user', () => {
    it('FAIL - password and confirmation are not equal', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test1';
      dto.passwordConfirmation = 'test2';
      try {
        await service.registerUser(dto);
      } catch (error) {
        expect(error instanceof InvalidRequestError).toBeTruthy();
      }
      expect(userRepoMock.getByEmail.callCount).toEqual(0);
      expect(userRepoMock.createUser.callCount).toEqual(0);
      expect(hasherMock.hash.callCount).toEqual(0);
    });

    it('FAIL - existing user with this email already exists', async () => {
      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';
      dto.passwordConfirmation = 'test';

      const userRepoMock = createStubInstance(UsersRepo);
      const existingUser = Object.create(User.prototype);
      userRepoMock.getByEmail.resolves(existingUser);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.hash.resolves('hash');
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      try {
        await service.registerUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }
      expect(userRepoMock.getByEmail.callCount).toEqual(1);
      expect(userRepoMock.createUser.callCount).toEqual(0);
      expect(hasherMock.hash.callCount).toEqual(0);
    });

    it('OK', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      userRepoMock.getByEmail.resolves(null);
      userRepoMock.createUser.resolves(undefined);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.hash.resolves('hash');
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';
      dto.passwordConfirmation = 'test';
      await service.registerUser(dto);
      expect(userRepoMock.getByEmail.callCount).toEqual(1);
      expect(userRepoMock.createUser.callCount).toEqual(1);
      expect(hasherMock.hash.callCount).toEqual(1);
    });
  });

  describe('Login user', () => {
    it('FAIL - user by email is not found', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      userRepoMock.getByEmail.resolves(null);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      try {
        await service.loginUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }

      expect(userRepoMock.getByEmail.callCount).toEqual(1);
      expect(sessionRepoMock.saveSession.callCount).toEqual(0);
      expect(hasherMock.compare.callCount).toEqual(0);
      expect(jwtHelperMock.signToken.callCount).toEqual(0);
    });

    it('FAIL - password and password hash don`t match', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const user = Object.create(User.prototype);
      userRepoMock.getByEmail.resolves(user);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.compare.resolves(false);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      try {
        await service.loginUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }

      expect(userRepoMock.getByEmail.callCount).toEqual(1);
      expect(hasherMock.compare.callCount).toEqual(1);
      expect(jwtHelperMock.signToken.callCount).toEqual(0);
      expect(sessionRepoMock.saveSession.callCount).toEqual(0);
    });

    it('OK', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const user = Object.create(User.prototype);
      userRepoMock.getByEmail.resolves(user);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      jwtHelperMock.signToken.resolves('hash');
      const hasherMock = createStubInstance(Hasher);
      hasherMock.compare.resolves(true);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      const result = await service.loginUser(dto);

      expect(result.access).toEqual('hash');
      expect(result.refresh).toEqual('hash');
      expect(userRepoMock.getByEmail.callCount).toEqual(1);
      expect(hasherMock.compare.callCount).toEqual(1);
      expect(jwtHelperMock.signToken.callCount).toEqual(2);
    });
  });

  describe('Get user info', () => {
    it('FAIL - user is not found', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      userRepoMock.getByEmail.resolves(null);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      try {
        await service.getUserInfo('test@ya.ru');
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
        expect(userRepoMock.getByEmail.callCount).toEqual(1);
      }
    });

    it('OK', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const user = Object.create(User.prototype);
      userRepoMock.getByEmail.resolves(user);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const result = await service.getUserInfo('test@ya.ru');
      expect(result).toStrictEqual(user);
      expect(userRepoMock.getByEmail.callCount).toEqual(1);
    });
  });

  describe('Get user sessions', () => {
    it('OK', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const testList = [];
      sessionRepoMock.getSessions.resolves(testList);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const result = await service.getUserSessions('test@ya.ru');
      expect(result).toStrictEqual(testList);
      expect(sessionRepoMock.getSessions.calledWith('test@ya.ru')).toBeTruthy();
      expect(sessionRepoMock.getSessions.callCount).toEqual(1);
    });
  });

  describe('Remove session', () => {
    it('FAIL - user is not session owner', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const testSession: TSessionModel = {
        email: 'test1@ya.ru',
        jti: 'f64cf4ae-cadd-4e36-8761-ca16224485a0',
        deviceId: 'f64cf4ae-cadd-4e36-8761-ca16224485a0',
        accessToken: 'test',
        refreshToken: 'test',
      };
      sessionRepoMock.getSession.resolves(testSession);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new RemoveSessionRequestDto();
      dto.jti = 'f64cf4ae-cadd-4e36-8761-ca16224485a0';
      try {
        await service.removeSession('test2@ya.ru', dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
        expect(sessionRepoMock.getSession.callCount).toEqual(1);
        expect(sessionRepoMock.removeSession.callCount).toEqual(0);
      }
    });

    it('OK', async () => {
      const userRepoMock = createStubInstance(UsersRepo);
      const sessionRepoMock = createStubInstance(RedisSessionRepo);
      const testSession: TSessionModel = {
        email: 'test1@ya.ru',
        jti: 'f64cf4ae-cadd-4e36-8761-ca16224485a0',
        deviceId: 'f64cf4ae-cadd-4e36-8761-ca16224485a0',
        accessToken: 'test',
        refreshToken: 'test',
      };
      sessionRepoMock.getSession.resolves(testSession);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(
        userRepoMock,
        sessionRepoMock,
        hasherMock,
        jwtHelperMock,
      );

      const dto = new RemoveSessionRequestDto();
      dto.jti = 'f64cf4ae-cadd-4e36-8761-ca16224485a0';

      await service.removeSession('test1@ya.ru', dto);
      expect(sessionRepoMock.getSession.callCount).toEqual(1);
      expect(sessionRepoMock.removeSession.callCount).toEqual(1);
    });
  });
});
