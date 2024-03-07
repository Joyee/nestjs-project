import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Inject('ETCD_CLIENT')
  private etcdClient: Etcd3;

  @Get('put')
  async put(@Query('key') key: string, @Query('value') value: string) {
    await this.etcdClient.put(key).value(value);
    return 'done';
  }

  @Get('get')
  async get(@Query('key') key: string) {
    return await this.etcdClient.get(key).string();
  }

  @Get('delete')
  async delete(@Query('key') key: string) {
    await this.etcdClient.delete().key(key);
    return 'done';
  }
}
