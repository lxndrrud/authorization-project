import { Sequelize } from 'sequelize-typescript';
import { Permission } from './models/Permission.model';
import { UserPermission } from './models/UserPermission.model';
import { User } from './models/User.model';

export const SEQUELIZE_CONNECTION = 'SEQUELIZE_CONNECTION';

export const SequelizeProvider = {
  provide: SEQUELIZE_CONNECTION,
  useFactory: async () => {
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
    });
    sequelize.addModels([User, Permission, UserPermission]);
    await sequelize.sync();
    return sequelize;
  },
};
