# nestjs-project

一些 NestJS 项目

### 二维码登录

状态:

- 未扫描 - tip: ''
- 已扫描，等待用户确认 - tip: 扫码成功，请用手机授权登录
- 已扫描，用户同意授权 - tip: 登录成功
- 已扫描，用户取消授权 - tip: ''
- 已过期 - tip: 二维码已过期，点击刷新

一般使用轮询就行，不用websocket。

比如 二维码出现后，每秒一次的轮询请求查询二维码状态

status: 0 -> 1(扫码后)