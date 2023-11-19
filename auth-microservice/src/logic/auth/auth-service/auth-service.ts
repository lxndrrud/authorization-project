import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dto/RegisterUser.dto';
import { User } from '../../../databases/Sequelize/models/User.model';
import { USERS_REPO } from '../users-repo/users-repo';
import { InternalError } from '../../../shared/errors/InternalError';
import { InvalidRequestError } from '../../../shared/errors/InvalidRequestError';
import { UTILS_HASHER } from '../../../shared/utils/hasher/hasher';
import { UTILS_JWT_HELPER } from '../../../shared/utils/jwt-helper/jwt-helper';
import { LoginUserRequestDto } from '../dto/LoginUserRequest.dto';
import { TSessionModel } from '../types/SessionModel.type';
import { SESSION_REPO } from '../sessions-repo/sessions-repo';
import { UUID, randomUUID } from 'crypto';
import { RemoveSessionRequestDto } from '../dto/RemoveSessionRequest.dto';

export const AUTH_SERVICE = 'AUTH_SERVICE';

interface IDepUsersRepo {
  getByEmail(email: string): Promise<User | null>;
  createUser(payload: RegisterUserDto): Promise<User>;
}

interface IDepSessionRepo {
  saveSession(payload: TSessionModel): Promise<void>;
  getSessions(userEmail: string): Promise<TSessionModel[]>;
  getSession(jti: UUID): Promise<TSessionModel>;
  removeSession(payload: TSessionModel): Promise<void>;
}

interface IDepHasher {
  hash(payload: string): Promise<string>;
  compare(raw: string, hashed: string): Promise<boolean>;
}

interface IDepJwtHelper {
  signToken(
    payload: {
      email: string;
      jti: UUID;
      deviceId: UUID;
    },
    expiresIn: string | number | undefined,
  ): Promise<string>;
  verifyAndGetPayload(token: string): Promise<{
    email: string;
    jti: UUID;
    deviceId: UUID;
  }>;
}

export interface IAuthService {
  registerUser(payload: RegisterUserDto): Promise<void>;
  loginUser(payload: LoginUserRequestDto): Promise<{
    access: string;
    refresh: string;
  }>;
  getUserInfo(email: string): Promise<User>;
  getUserSessions(email: string): Promise<TSessionModel[]>;
  removeSession(
    userEmail: string,
    payload: RemoveSessionRequestDto,
  ): Promise<void>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USERS_REPO) private readonly usersRepo: IDepUsersRepo,
    @Inject(SESSION_REPO) private readonly sessionRepo: IDepSessionRepo,
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
    hashedPayload.firstname = payload.firstname;
    hashedPayload.patronymic = payload.patronymic;
    hashedPayload.lastname = payload.lastname;
    hashedPayload.password = await this.hasher.hash(payload.password);
    hashedPayload.passwordConfirmation = hashedPayload.password;

    await this.usersRepo.createUser(hashedPayload);
  }

  public async loginUser(payload: LoginUserRequestDto) {
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
    const jti = randomUUID();
    const deviceId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtHelper.signToken(
        { email: user.email, jti, deviceId },
        process.env.JWT_ACCESS_EXPIRES_IN as string,
      ),
      this.jwtHelper.signToken(
        { email: user.email, jti, deviceId },
        process.env.JWT_REFRESH_EXPIRES_IN as string,
      ),
    ]);
    const sessionPayload = {
      email: user.email,
      jti,
      deviceId,
      accessToken,
      refreshToken,
    } as TSessionModel;
    await this.sessionRepo.saveSession(sessionPayload);

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  public async getUserInfo(email: string) {
    const user = await this.usersRepo.getByEmail(email);
    if (!user) throw new InternalError('User by specified email is not found.');
    return user;
  }

  public async getUserSessions(email: string) {
    const sessions = await this.sessionRepo.getSessions(email);
    return sessions;
  }

  public async removeSession(
    userEmail: string,
    payload: RemoveSessionRequestDto,
  ) {
    const session = await this.sessionRepo.getSession(payload.jti);
    const isOwnerDeletesSession = session.email === userEmail;
    if (!isOwnerDeletesSession)
      throw new InternalError('Session is not found. Code: 43.');
    await this.sessionRepo.removeSession(session);
  }
}
