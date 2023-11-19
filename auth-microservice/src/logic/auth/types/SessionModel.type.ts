import { UUID } from 'crypto';

export type TSessionModel = {
  jti: UUID;
  deviceId: UUID;
  email: string;
  refreshToken: string;
  accessToken: string;
};
