import { Module } from '@nestjs/common';
import { AuthModule } from './logic/auth/auth.module';
import { DatabasesModule } from './databases/databases.module';
import { SharedModule } from './shared/shared.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    DatabasesModule,
    SharedModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
