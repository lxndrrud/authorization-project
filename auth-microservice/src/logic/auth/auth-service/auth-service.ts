import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/RegisterUser.dto';
import { User } from '../../../databases/Sequelize/models/User.model';
import { USERS_REPO } from '../users-repo/users-repo';
import { InternalError } from '../../../shared/errors/InternalError';
import { InvalidRequestError } from '../../../shared/errors/InvalidRequestError';
import { UTILS_HASHER } from '../../../shared/utils/hasher/hasher';
import { UTILS_JWT_HELPER } from '../../../shared/utils/jwt-helper/jwt-helper';
import { LoginUserRequestDto } from '../dto/LoginUserRequest.dto';

export const AUTH_SERVICE = 'AUTH_SERVICE';

interface IDepUsersRepo {
  getByEmail(email: string): Promise<User | null>;
  createUser(payload: RegisterUserDto): Promise<User>;
}

interface IDepHasher {
  hash(payload: string): Promise<string>;
  compare(raw: string, hashed: string): Promise<boolean>;
}

interface IDepJwtHelper {
  signToken(
    payload: {
      email: string;
    },
    expiresIn: string | number | undefined,
  ): Promise<string>;
}

export interface IAuthService {
  registerUser(payload: RegisterUserDto): Promise<void>;
  loginUser(payload: LoginUserRequestDto): Promise<{
    access: string;
    refresh: string;
  }>;
  getUserInfo(email: string): Promise<User>;
}

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

  async loginUser(payload: LoginUserRequestDto) {
    const user = await this.usersRepo.getByEmail(payload.email);
    if (!user)
      throw new InternalError(
        'User with this combination of email and password is not found!',
      );
    const isPasswordValid = await this.hasher.compare(
      payload.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new InternalError(
        'User with this combination of email and password is not found!',
      );
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtHelper.signToken(
        { email: user.email },
        process.env.JWT_ACCESS_EXPIRES_IN as string,
      ),
      this.jwtHelper.signToken(
        { email: user.email },
        process.env.JWT_REFRESH_EXPIRES_IN as string,
      ),
    ]);

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  async getUserInfo(email: string) {
    const user = await this.usersRepo.getByEmail(email);
    if (!user) throw new InternalError('User by specified email is not found.');
    return user;
  }
}
