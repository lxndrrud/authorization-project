import { Injectable } from '@nestjs/common';
import { User } from '../../../databases/Sequelize/models/User.model';
import { RegisterUserDto } from '../dto/RegisterUser.dto';

export const USERS_REPO = 'USERS_REPO';

export interface IUsersRepo {
  getByEmail(email: string): Promise<User | null>;
  createUser(payload: RegisterUserDto): Promise<User>;
}

@Injectable()
export class UsersRepo implements IUsersRepo {
  async getByEmail(email: string) {
    const user = await User.findOne({
      where: { email },
    });
    return user;
  }

  async createUser(payload: RegisterUserDto) {
    const user = await User.create(
      {
        email: payload.email,
        password: payload.password,
        firstname: payload.firstname,
        patronymic: payload.patronymic,
        lastname: payload.lastname,
      },
      { returning: ['*'] },
    );
    return user;
  }
}
