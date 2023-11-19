import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTokensRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
