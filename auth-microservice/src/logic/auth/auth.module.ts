import { Module } from '@nestjs/common';
import { AUTH_SERVICE, AuthService } from './auth-service/auth-service';
import { USERS_REPO, UsersRepo } from './users-repo/users-repo';
import { SharedModule } from '../../shared/shared.module';
import { DatabasesModule } from '../../databases/databases.module';
import { RedisSessionRepo, SESSION_REPO } from './sessions-repo/sessions-repo';
import { JwtStrategy } from './jwt-strategy/jwt-strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [SharedModule, DatabasesModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: USERS_REPO,
      useClass: UsersRepo,
    },
    {
      provide: SESSION_REPO,
      useClass: RedisSessionRepo,
    },
    JwtStrategy,
  ],
  exports: [JwtStrategy],
})
export class AuthModule {}
