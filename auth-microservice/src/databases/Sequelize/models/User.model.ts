import {
  Table,
  DataType,
  Model,
  Column,
  AllowNull,
  IsEmail,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: `users` })
export class User extends Model {
  @IsEmail
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  password: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  firstname: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  patronymic: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  lastname: string;
}
