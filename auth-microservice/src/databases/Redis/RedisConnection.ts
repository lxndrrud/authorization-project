import Redis from 'ioredis';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';

export const RedisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT as string),
  password: process.env.REDIS_PASSWORD,
});
