import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenPayloadSchema } from './validation-schemas/TokenPayload.schema';

export const UTILS_JWT_HELPER = 'UTILS_JWT_HELPER';

export interface IJwtHelper {
  signToken(
    payload: {
      email: string;
    },
    expiresIn: string | number | undefined,
  ): Promise<string>;
  verifyAndGetPayload(token: string): Promise<{
    email: string;
  }>;
}

@Injectable()
export class JwtHelper implements IJwtHelper {
  /**
   *
   * @param payload
   * @param expiresIn expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
   * @returns
   */
  async signToken(
    payload: { email: string },
    expiresIn: string | number | undefined,
  ) {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: expiresIn,
    });
  }

  async verifyAndGetPayload(token: string) {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    const resultPayload = TokenPayloadSchema.validate(payload, {
      stripUnknown: true,
    });
    if (resultPayload.error) throw resultPayload.error;
    return resultPayload.value as { email: string };
  }
}
