import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class RemoveSessionRequestDto {
  @IsNotEmpty()
  @IsUUID()
  jti: UUID;
}
