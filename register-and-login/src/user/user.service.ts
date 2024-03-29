import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { WechatUserInfo } from '../auth/auth.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register(createUser: CreateUserDto) {
    const { username } = createUser;

    const foundUser = await this.userRepository.findOne({
      where: { username },
    });
    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userRepository.create(createUser); // ==> new User(createUser)
    console.log(newUser);
    return await this.userRepository.save(newUser);
  }

  async findOne(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async findByOpenid(openid: string) {
    return await this.userRepository.findOne({ where: { openid } });
  }

  async registerByWechat(userInfo: WechatUserInfo) {
    const { nickname, openid, headimgurl } = userInfo;
    const newUser = await this.userRepository.create({
      nickName: nickname,
      openid,
      avatar: headimgurl,
    });
    return await this.userRepository.save(newUser);
  }
}
