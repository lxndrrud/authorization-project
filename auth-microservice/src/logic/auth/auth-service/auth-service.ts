import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/RegisterUser.dto';
import { User } from '../../../databases/Sequelize/models/User.model';
import { USERS_REPO } from '../users-repo/users-repo';
import { InternalError } from '../../../shared/errors/InternalError';
import { InvalidRequestError } from '../../../shared/errors/InvalidRequestError';
import { UTILS_HASHER } from '../../../shared/utils/hasher/hasher';
import { UTILS_JWT_HELPER } from '../../../shared/utils/jwt-helper/jwt-helper';

export const AUTH_SERVICE = 'AUTH_SERVICE';

interface IDepUsersRepo {
  getByEmail(email: string): Promise<User | null>;
  createUser(payload: RegisterUserDto): Promise<User>;
}

interface IDepHasher {
  hash(payload: string): Promise<string>;
}

interface IDepJwtHelper {
  signToken(
    payload: {
      email: string;
    },
    expiresIn: string | number | undefined,
  ): Promise<string>;
}

export interface IAuthService {}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USERS_REPO) private readonly usersRepo: IDepUsersRepo,
    @Inject(UTILS_HASHER) private readonly hasher: IDepHasher,
    @Inject(UTILS_JWT_HELPER) private readonly jwtHelper: IDepJwtHelper,
  ) {}

  public async registerUser(payload: RegisterUserDto) {
    if (payload.password !== payload.passwordConfirmation)
      throw new InvalidRequestError(
        'Password does not match password confirmation.',
      );

    const user = await this.usersRepo.getByEmail(payload.email);
    if (user)
      throw new InternalError('User with the same email already exists.');

    const hashedPayload = new RegisterUserDto();
    hashedPayload.email = payload.email;
    hashedPayload.password = await this.hasher.hash(payload.password);
    hashedPayload.passwordConfirmation = hashedPayload.password;

    await this.usersRepo.createUser(hashedPayload);
  }
}
