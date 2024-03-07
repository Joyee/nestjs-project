微服务架构的系统都会有配置中心和注册中心。

### 配置中心

### etcd

常用指令

```
etcd put key value

etcd get key

etcd del key

etcdctl watch key
```

执行指令时 需要加上 `--user、--password`

`etcdctl get --user=root --password=wangyibo key`

如果不想每次执行的时候指定用户名和密码，设置环境变量

```
export ETCDCTL_USER=root
export ETCDCTL_PASSWORD=wangyibo
```