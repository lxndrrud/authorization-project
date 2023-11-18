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

describe('AuthService', () => {
  describe('Register user', () => {
    it('FAIL - password and confirmation are not equal', async () => {
      const repoMock = createStubInstance(UsersRepo);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test1';
      dto.passwordConfirmation = 'test2';
      try {
        await service.registerUser(dto);
      } catch (error) {
        expect(error instanceof InvalidRequestError).toBeTruthy();
      }
      expect(repoMock.getByEmail.callCount).toEqual(0);
      expect(repoMock.createUser.callCount).toEqual(0);
      expect(hasherMock.hash.callCount).toEqual(0);
    });

    it('FAIL - existing user with this email already exists', async () => {
      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';
      dto.passwordConfirmation = 'test';

      const repoMock = createStubInstance(UsersRepo);
      const existingUser = Object.create(User.prototype);
      repoMock.getByEmail.resolves(existingUser);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.hash.resolves('hash');
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      try {
        await service.registerUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }
      expect(repoMock.getByEmail.callCount).toEqual(1);
      expect(repoMock.createUser.callCount).toEqual(0);
      expect(hasherMock.hash.callCount).toEqual(0);
    });

    it('OK', async () => {
      const repoMock = createStubInstance(UsersRepo);
      repoMock.getByEmail.resolves(null);
      repoMock.createUser.resolves(undefined);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.hash.resolves('hash');
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';
      dto.passwordConfirmation = 'test';
      await service.registerUser(dto);
      expect(repoMock.getByEmail.callCount).toEqual(1);
      expect(repoMock.createUser.callCount).toEqual(1);
      expect(hasherMock.hash.callCount).toEqual(1);
    });
  });

  describe('Login user', () => {
    it('FAIL - user by email is not found', async () => {
      const repoMock = createStubInstance(UsersRepo);
      repoMock.getByEmail.resolves(null);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      try {
        await service.loginUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }

      expect(repoMock.getByEmail.callCount).toEqual(1);
      expect(hasherMock.compare.callCount).toEqual(0);
      expect(jwtHelperMock.signToken.callCount).toEqual(0);
    });

    it('FAIL - password and password hash don`t match', async () => {
      const repoMock = createStubInstance(UsersRepo);
      const user = Object.create(User.prototype);
      repoMock.getByEmail.resolves(user);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.compare.resolves(false);
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      try {
        await service.loginUser(dto);
      } catch (error) {
        expect(error instanceof InternalError).toBeTruthy();
      }

      expect(repoMock.getByEmail.callCount).toEqual(1);
      expect(hasherMock.compare.callCount).toEqual(1);
      expect(jwtHelperMock.signToken.callCount).toEqual(0);
    });

    it('OK', async () => {
      const repoMock = createStubInstance(UsersRepo);
      const user = Object.create(User.prototype);
      repoMock.getByEmail.resolves(user);
      const jwtHelperMock = createStubInstance(JwtHelper);
      jwtHelperMock.signToken.resolves('hash');
      const hasherMock = createStubInstance(Hasher);
      hasherMock.compare.resolves(true);
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new LoginUserRequestDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';

      const result = await service.loginUser(dto);

      expect(result.access).toEqual('hash');
      expect(result.refresh).toEqual('hash');
      expect(repoMock.getByEmail.callCount).toEqual(1);
      expect(hasherMock.compare.callCount).toEqual(1);
      expect(jwtHelperMock.signToken.callCount).toEqual(2);
    });
  });
});
