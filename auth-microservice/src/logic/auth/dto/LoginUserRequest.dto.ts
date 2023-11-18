import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
