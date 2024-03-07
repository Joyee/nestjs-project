const { Etcd3 } = require('etcd3')
const client = new Etcd3({
  hosts: 'http://localhost:2379',
  auth: {
    username: 'root',
    password: 'wangyibo',
  },
})

async function saveConfig(key, value) {
  await client.put(key).value(value)
}

async function getConfig(key) {
  return await client.get(key).string()
}

async function deleteConfig(key) {
  await client.delete().key(key)
}

// 服务注册
async function registerService(serviceName, instanceId, metadata) {
  const key = `/services/${serviceName}/${instanceId}`
  const lease = client.lease(10)
  await lease.put(key).value(JSON.stringify(metadata))
  lease.on('lost', async () => {
    console.log('租约过期，重新注册')
    await registerService(serviceName, instanceId, metadata)
  })
}

// 服务发现
async function discoverService(serviceName) {
  const instances = await client.getAll().prefix(`/services/${serviceName}`).strings()
  return Object.entries(instances).map(([key, value]) => JSON.parse(value))
}

// 监听服务变更
async function watchService(serviceName, callback) {
  const watcher = await client.watch().prefix(`/services/${serviceName}`).create()
  watcher
    .on('put', async (event) => {
      console.log('新的服务节点添加:', event.key.toString())
      callback(await discoverService(serviceName))
    })
    .on('delete', async (event) => {
      console.log('服务节点删除:', event.key.toString())
      callback(await discoverService(serviceName))
    })
}

// ;(async () => {
//   // const services = await client.get('/services/a').string()
//   const services = await getConfig('/services/a')
//   console.log('service A:', services)

//   const allServices = await client.getAll().prefix('/services').keys()
//   console.log('all services:', allServices)

//   const watcher = await client.watch().key('/services/a').create()
//   watcher.on('put', (req) => {
//     console.log('put', req.value.toString())
//   })
//   watcher.on('delete', (req) => {
//     console.log('delete')
//   })
// })()

;(async function main() {
  const serviceName = 'my_service'

  await registerService(serviceName, 'instance_1', { host: 'localhost', port: 3001 })
  await registerService(serviceName, 'instance_2', { host: 'localhost', port: 3002 })

  const instances = await discoverService(serviceName)
  console.log('所有服务节点:', instances)

  watchService(serviceName, (updateInstances) => {
    console.log('服务节点有变动:', updateInstances)
  })
})()
