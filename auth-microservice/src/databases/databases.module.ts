import { Module } from '@nestjs/common';
import { SequelizeProvider } from './Sequelize/SequelizeConnection';

@Module({
  providers: [SequelizeProvider],
  exports: [SequelizeProvider],
})
export class DatabasesModule {}
