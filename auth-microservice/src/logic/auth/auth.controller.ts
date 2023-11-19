import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/RegisterUser.dto';
import { AUTH_SERVICE, IAuthService } from './auth-service/auth-service';
import { JwtAuthGuard } from './jwt-auth-guard/jwt-auth-guard';
import { GetUserInfoResponseDto } from './dto/GetUserInfoResponse.dto';
import { LoginUserRequestDto } from './dto/LoginUserRequest.dto';
import { LoginUserResponseDto } from './dto/LoginUserResponse.dto';
import { GetUserSessionsResponseDto } from './dto/GetUserSessionsResponse.dto';
import { RemoveSessionRequestDto } from './dto/RemoveSessionRequest.dto';
import { UpdateTokensRequestDto } from './dto/UpdateTokensRequestDto';
import { UpdateTokensResponseDto } from './dto/UpdateTokensResponse.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {}

  @Post('/register')
  async registerUser(@Body() payload: RegisterUserDto) {
    await this.authService.registerUser(payload);
  }

  @Post('/login')
  async logIn(@Body() payload: LoginUserRequestDto) {
    const result = await this.authService.loginUser(payload);
    const dto = new LoginUserResponseDto(result.access, result.refresh);
    return dto;
  }

  @Post('/updateTokens')
  async updateTokens(@Body() payload: UpdateTokensRequestDto) {
    const result = await this.authService.updateTokens(payload);
    const dto = new UpdateTokensResponseDto(result.access, result.refresh);
    return dto;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:email')
  async getUserInfoByEmail(@Param('email') email: string) {
    const user = await this.authService.getUserInfo(email);
    const dto = new GetUserInfoResponseDto(
      user.email,
      user.firstname,
      user.patronymic,
      user.lastname,
    );
    return dto;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sessions')
  async getUserSessions(@Req() request: any) {
    const email = request.user.email as string;
    const sessions = await this.authService.getUserSessions(email);
    const preparedSessions = sessions.map(
      (el) => new GetUserSessionsResponseDto(el.jti, el.deviceId),
    );
    return preparedSessions;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/sessions')
  async removeSession(
    @Req() request: any,
    @Body() payload: RemoveSessionRequestDto,
  ) {
    const email = request.user.email as string;
    await this.authService.removeSession(email, payload);
  }
}
