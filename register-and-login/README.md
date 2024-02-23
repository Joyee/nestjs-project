### 连接数据库的方式

1. .env 和 .env.prod

```
app.module.ts

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [envConfig.path],
}),
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    return {
      type: 'mysql', // 数据库类型
      entities: [User], // 数据表实体
      host: configService.get('DB_HOST'), // 主机，默认为localhost
      port: configService.get<number>('DB_PORT'), // 端口号
      username: configService.get('DB_USER'), // 用户名
      password: configService.get('DB_PASSWD'), // 密码
      database: configService.get('DB_DATABASE'), //数据库名
      timezone: '+08:00', //服务器上配置的时区
      synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
    };
  },
  inject: [ConfigService],
}),
```

2. ormconfig.json
