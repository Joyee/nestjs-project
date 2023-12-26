import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Redirect,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ShortLongMapService } from './short-long-map.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(ShortLongMapService)
  private shortLongMapService: ShortLongMapService;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('short-url')
  async generateShortUrl(@Query('url') url: string) {
    await this.shortLongMapService.generate(url);
  }

  @Get(':code')
  @Redirect()
  async jump(@Param('code') code: string) {
    const url = await this.shortLongMapService.gentLongUrl(code);
    if (!url) {
      throw new BadRequestException('短链接不存在');
    }

    return { url, statusCode: 200 };
  }
}
