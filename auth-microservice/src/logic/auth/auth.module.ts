import { Module } from '@nestjs/common';
import { AUTH_SERVICE, AuthService } from './auth-service/auth-service';
import { USERS_REPO, UsersRepo } from './users-repo/users-repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: USERS_REPO,
      useClass: UsersRepo,
    },
  ],
})
export class AuthModule {}
