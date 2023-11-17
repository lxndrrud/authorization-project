import {
  Table,
  DataType,
  Model,
  Column,
  Length,
  BelongsToMany,
  AllowNull,
} from 'sequelize-typescript';
import { Permission } from './Permission.model';
import { UserPermission } from './UserPermission.model';

@Table({ tableName: `users` })
export class User extends Model {
  @AllowNull(false)
  @Length({ max: 50 })
  @Column(DataType.STRING)
  email: string;

  @AllowNull(false)
  @Length({ max: 200 })
  @Column(DataType.STRING)
  password: string;

  @BelongsToMany(() => Permission, () => UserPermission)
  permissions: Permission;
}
