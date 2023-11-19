import { UUID } from 'crypto';

export class GetUserSessionsResponseDto {
  constructor(
    public jti: UUID,
    public deviceId: UUID,
  ) {}
}
