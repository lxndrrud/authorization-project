import { Module } from '@nestjs/common';
import { SequelizeProvider } from './Sequelize/SequelizeConnection';
import { REDIS_CONNECTION, RedisConnection } from './Redis/RedisConnection';

@Module({
  providers: [
    SequelizeProvider,
    { provide: REDIS_CONNECTION, useValue: RedisConnection },
  ],
  exports: [
    SequelizeProvider,
    { provide: REDIS_CONNECTION, useValue: RedisConnection },
  ],
})
export class DatabasesModule {}
