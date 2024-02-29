import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  AccessTokenInfo,
  AccessConfig,
  WechatError,
  WechatUserInfo,
} from './auth.interface';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private accessTokenInfo: AccessTokenInfo;
  public apiServer = 'https://api.weixin.qq.com';

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private httpService: HttpService,
  ) {}

  createToken(user: Partial<User>) {
    return this.jwtService.sign(user);
  }

  async login(user: Partial<User>) {
    const token = this.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    return { token };
  }

  async getUser(user) {
    return await this.userService.findOne(user.id);
  }

  async loginWithWeChat(code: string) {
    if (!code) {
      throw new BadRequestException('请输入微信授权码');
    }
    await this.getAccessToken(code);

    const foundUser = await this.getUserByOpenid();
    if (!foundUser) {
      const userInfo: WechatUserInfo = await this.getWechatUserInfo();
      return this.userService.registerByWechat(userInfo);
    }
    return this.login(foundUser);
  }

  async getUserByOpenid() {
    return await this.userService.findByOpenid(this.accessTokenInfo.openid);
  }

  async getAccessToken(code: string) {
    const { WEI_APPID, WEI_APPSECRET } = process.env;
    if (!WEI_APPSECRET) {
      throw new BadRequestException('appSecret不能为空');
    }
    if (
      !this.accessTokenInfo ||
      (this.accessTokenInfo && this.isExpires(this.accessTokenInfo))
    ) {
      const res: AxiosResponse<WechatError & AccessConfig, any> =
        await lastValueFrom(
          this.httpService.get(
            `${this.apiServer}/sns/oauth2/access_token?appid=${WEI_APPID}&secret=${WEI_APPSECRET}&code=${code}&grant_type=authorization_code`,
          ),
        );
      if (res.data.errcode) {
        throw new BadRequestException(
          `[getAccessToken] errcode:${res.data.errcode}, errmsg: ${res.data.errmsg}`,
        );
      }
      this.accessTokenInfo = {
        accessToken: res.data.access_token,
        expiresIn: res.data.expires_in,
        getTime: Date.now(),
        openid: res.data.openid,
      };
    }
    return this.accessTokenInfo.accessToken;
  }

  async getWechatUserInfo() {
    const res: AxiosResponse<WechatError & WechatUserInfo> =
      await lastValueFrom(
        this.httpService.get(
          `https://api.weixin.qq.com/sns/userinfo?access_token=${this.accessTokenInfo.accessToken}&openid=${this.accessTokenInfo.openid}`,
        ),
      );
    if (res.data.errcode) {
      throw new BadRequestException(
        `[getUserInfo] errcode: ${res.data.errcode}, errmsg: ${res.data.errmsg}`,
      );
    }
    return res.data;
  }

  async isExpires(access) {
    return Date.now() - access.getTime > this.accessTokenInfo.expiresIn * 1000;
  }
}
