import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import urlencode from 'urlencode';

@ApiTags('验证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req) {
    return this.authService.login({ ...dto, ...req.user });
  }

  @ApiOperation({ summary: '微信登录跳转' })
  @Get('wechatLogin')
  async wechatLogin(@Headers() header, @Res() res) {
    const APPID = process.env.WEI_APPID;
    const redirectUri = urlencode('http://localhost:3300/api');
    res.redirect(
      `https://open.weixin.qq.com/connect/qrconnect?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`,
    );
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({})
  @Post('wechat')
  async loginWithWeChat(@Body('code') code: string) {
    return this.authService.loginWithWeChat(code);
  }
}
