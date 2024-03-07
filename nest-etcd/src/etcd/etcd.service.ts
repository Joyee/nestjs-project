import { Injectable, Inject } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

@Injectable()
export class EtcdService {
  @Inject('ETCD_CLIENT') private client: Etcd3;

  async saveConfig(key, value) {
    await this.client.put(key).value(value);
  }

  async getConfig(key) {
    return await this.client.get(key).string();
  }

  async deleteConfig(key) {
    await this.client.delete().key(key);
  }

  // 服务注册
  async registerService(serviceName, instanceId, metadata) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = this.client.lease(10);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
      console.log('租约过期，重新注册...');
      await this.registerService(serviceName, instanceId, metadata);
    });
  }

  // 服务发现
  async discoverService(serviceName) {
    const instances = await this.client
      .getAll()
      .prefix(`/services/${serviceName}`)
      .strings();
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
  }

  // 监听服务
  async watchService(serviceName, callback) {
    const watcher = await this.client
      .watch()
      .prefix(`/services/${serviceName}`)
      .create();

    watcher
      .on('put', async (event) => {
        console.log('服务节点有新增:', event.key.toString());
        callback(await this.discoverService(serviceName));
      })
      .on('delete', async (event) => {
        console.log('服务节点有删除:', event.key.toString());
        callback(await this.discoverService(serviceName));
      });
  }
}
