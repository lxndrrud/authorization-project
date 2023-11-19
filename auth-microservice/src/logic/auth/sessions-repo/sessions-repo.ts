import { Redis } from 'ioredis';
import { REDIS_CONNECTION } from '../../../databases/Redis/RedisConnection';
import { Inject } from '@nestjs/common';
import { TSessionModel } from '../types/SessionModel.type';
import { UUID } from 'crypto';

export const SESSION_REPO = 'SESSION_REPO';

export interface ISessionRepo {
  saveSession(payload: TSessionModel): Promise<void>;
  getSessions(userEmail: string): Promise<TSessionModel[]>;
  getSession(jti: UUID): Promise<TSessionModel>;
  removeSession(payload: TSessionModel): Promise<void>;
}

export class RedisSessionRepo implements ISessionRepo {
  constructor(
    @Inject(REDIS_CONNECTION) private readonly redisConnection: Redis,
  ) {}

  public async saveSession(payload: TSessionModel) {
    const trx = this.redisConnection.multi();
    trx.set(`session:${payload.jti}`, JSON.stringify(payload));
    trx.lpush(`user_session:${payload.email}`, JSON.stringify(payload));
    await trx.exec();
  }

  public async getSessions(userEmail: string) {
    const rawSessions = await this.redisConnection.lrange(
      `user_session:${userEmail}`,
      0,
      -1,
    );
    return rawSessions.map((el) => JSON.parse(el) as TSessionModel);
  }

  /**
   * @throws
   */
  public async getSession(jti: UUID) {
    const rawSession = await this.redisConnection.get(`session:${jti}`);
    if (!rawSession) throw new Error('Session is not found. Code: 41.');
    const preparedSession = JSON.parse(rawSession) as TSessionModel;
    return preparedSession;
  }

  public async removeSession(payload: TSessionModel) {
    const trx = this.redisConnection.multi();
    trx.del(`session:${payload.jti}`);
    trx.lrem(`user_session:${payload.email}`, 0, JSON.stringify(payload));
    await trx.exec();
  }
}
