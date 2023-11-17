import {
  Table,
  Model,
  Column,
  DataType,
  Length,
  BelongsToMany,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './User.model';
import { UserPermission } from './UserPermission.model';

@Table({ tableName: `permissions` })
export class Permission extends Model {
  @AllowNull(false)
  @Length({ max: 50 })
  @Column(DataType.STRING)
  title: string;

  @BelongsToMany(() => User, () => UserPermission)
  users: Array<User & { UserPermission: UserPermission }>;
}
