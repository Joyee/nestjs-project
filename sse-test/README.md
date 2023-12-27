### Server Send Event

比如 CICD平台的实时日志、ChatGPT，就是使用sse。

在 控制台 Network查看 `content-type: text/event-stream`。

与 `Websocket`不同的是，SSH会自动重连。Websocket 需要手动。
