import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User.model';
import { Permission } from './Permission.model';

@Table({ tableName: `user_permission` })
export class UserPermission extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;
}
