import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ required: false })
  nickName: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;
}
