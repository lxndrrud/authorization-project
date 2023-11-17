import { AuthService } from './auth-service';
import { User } from '../../../databases/Sequelize/models/User.model';
import { createStubInstance } from 'sinon';
import { Hasher } from '../../../shared/utils/hasher/hasher';
import { UsersRepo } from '../users-repo/users-repo';
import { JwtHelper } from '../../../shared/utils/jwt-helper/jwt-helper';
import { RegisterUserDto } from '../dto/RegisterUser.dto';
import { InvalidRequestError } from '../../../shared/errors/InvalidRequestError';
import { InternalError } from '../../../shared/errors/InternalError';

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
      const repoMock = createStubInstance(UsersRepo);
      const existingUser = new User();
      repoMock.getByEmail.resolves(existingUser);
      const jwtHelperMock = createStubInstance(JwtHelper);
      const hasherMock = createStubInstance(Hasher);
      hasherMock.hash.resolves('hash');
      const service = new AuthService(repoMock, hasherMock, jwtHelperMock);

      const dto = new RegisterUserDto();
      dto.email = 'test@ya.ru';
      dto.password = 'test';
      dto.passwordConfirmation = 'test';
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
});
