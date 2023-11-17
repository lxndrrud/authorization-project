import { Module } from '@nestjs/common';
import { AuthModule } from './logic/auth/auth.module';
import { DatabasesModule } from './databases/databases.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [AuthModule, DatabasesModule, SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
