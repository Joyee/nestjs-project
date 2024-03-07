import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { EtcdService } from '../etcd/etcd.service';

@Controller('aaa')
export class AaaController {
  constructor(private readonly aaaService: AaaService) {}

  @Inject(EtcdService) private etcdService: EtcdService;

  @Get('save')
  async saveConfig(@Query('value') value: string) {
    await this.etcdService.saveConfig('aaa', value);
    return 'done';
  }

  @Get('get')
  async getConfig(@Query('key') key: string) {
    return await this.etcdService.getConfig(key);
  }
}
