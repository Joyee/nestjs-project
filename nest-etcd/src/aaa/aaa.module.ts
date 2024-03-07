import { Module } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { AaaController } from './aaa.controller';
import { EtcdModule } from '../etcd/etcd.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // EtcdModule.forRoot({
    //   hosts: 'http://localhost:2379',
    //   auth: {
    //     username: 'root',
    //     password: 'wangyibo',
    //   },
    // }),
    EtcdModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        await 111;
        return {
          hosts: configService.get('ETCD_HOSTS'),
          auth: {
            username: configService.get('ETCD_USERNAME'),
            password: configService.get('ETCD_PASSWORD'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AaaController],
  providers: [AaaService],
})
export class AaaModule {}
