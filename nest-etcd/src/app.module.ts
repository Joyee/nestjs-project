import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';
import { ConfigModule } from '@nestjs/config';
import { EtcdModule } from './etcd/etcd.module';
import { AaaModule } from './aaa/aaa.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EtcdModule, AaaModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ETCD_CLIENT',
      useFactory() {
        const { ETCD_USERNAME, ETCD_PASSWORD } = process.env;
        const client = new Etcd3({
          hosts: 'http://localhost:2379',
          auth: {
            username: ETCD_USERNAME,
            password: ETCD_PASSWORD,
          },
        });
        return client;
      },
    },
  ],
})
export class AppModule {}
