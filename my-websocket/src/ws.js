const { EventEmitter } = require('events')
const http = require('http')
const crypto = require('crypto')

function hashKey(key) {
  const hash = crypto.createHash('sha1')
  hash.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
  return hash.digest('base64')
}
// console.log(hashKey('8jyT0ZcOjofbS/0yzpMvhg=='))

// 用 mask key 来解密数据 固定算法
function handleMask(maskBytes, data) {
  const payload = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) {
    payload[i] = maskBytes[i % 4] ^ data[i]
  }
  return payload
}

// 这里只处理数据长度小于 125 的情况 payload.length < 126
function encodeMessage(opcode, payload) {
  // 第一个字节是 opcode，我们把第一位置 1 ，通过按位或的方式
  let bufferData = Buffer.alloc(payload.length + 2)

  // 第一个字节是 opcode 把第一位设置为1，通过按位或的方式
  let byte1 = parseInt('10000000', 2) | opcode // 设置 FIN 为 1
  // 服务端给客户端回消息不需要 mask，所以第二个字节就是 payload 长度
  let byte2 = payload.length

  // 分别把这前两个字节的数据写到 buffer 里，指定不同的 offset：
  bufferData.writeUInt8(byte1, 0)
  bufferData.writeUInt8(byte2, 1)

  // 之后把payload写在后面
  payload.copy(bufferData, 2)

  // 综上websocket 的 frame 就构造完了

  return bufferData
}

const OPCODES = {
  CONTINUE: 0,
  TEXT: 1, // 文本
  BINARY: 2, // 二进制
  CLOSE: 8,
  PING: 9,
  PONG: 10,
}

class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options)

    const server = http.createServer()
    server.listen(options.port || 8080)

    server.on('upgrade', (req, socket) => {
      this.socket = socket
      socket.setKeepAlive(true)

      const resHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + hashKey(req.headers['sec-websocket-key']),
        '',
        '',
      ].join('\r\n')
      socket.write(resHeaders)

      socket.on('data', (data) => {
        this.processData(data)
      })
      socket.on('close', (error) => {
        this.emit('close')
      })
    })
  }

  processData(bufferData) {
    // opcode
    // 读取 8 位无符号整数的内容，也就是一个字节的内容。参数是偏移的字节，这里是 0
    const byte1 = bufferData.readUInt8(0)
    // 通过位运算取出后四位，这就是 opcode 了
    let opcode = byte1 & 0x0f

    const byte2 = bufferData.readUInt8(1)
    const str2 = byte2.toString(2) // 转成二进制字符串
    const MASK = str2[0] // 第一位就是mask

    let curByteIndex = 2 // 存储当前处理到第几个字节
    let payloadLength = parseInt(str2.substring(1), 2) // 截取后 7 位的子串，parseInt 成数字
    // 如果是 126，那就从第 3 个字节开始，读取 2 个字节也就是 16 位的长度，用 buffer.readUInt16BE 方法。
    if (payloadLength === 126) {
      payloadLength = bufferData.readUInt16BE(2)
      curByteIndex += 2
    } else if (payloadLength === 127) {
      // 如果是 127，那就从第 3 个字节开始，读取 8 个字节也就是 64 位的长度，用 buffer.readBigUInt64BE 方法。
      payloadLength = bufferData.readBigUInt64BE(2)
      curByteIndex += 8
    }

    let realData = null
    // 先 mask 要处理，这个是用来给内容解密的，即读取第四个字节 mask-key
    if (MASK) {
      const maskKey = bufferData.slice(curByteIndex, curByteIndex + 4)
      curByteIndex += 4
      const payloadData = bufferData.slice(curByteIndex, curByteIndex + payloadLength)
      realData = handleMask(maskKey, payloadData)
    }

    // 拿到了 payload长度后，用这个长度去截取内容
    this.handleRealData(opcode, realData)
  }

  handleRealData(opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8'))
        break
      case OPCODES.BINARY:
        this.emit('data', realDataBuffer)
        break
      default:
        this.emit('close')
        break
    }
  }

  send(data) {
    let opcode
    let buffer
    if (Buffer.isBuffer(data)) {
      opcode = OPCODES.BINARY
      buffer = data
    } else if (typeof data === 'string') {
      opcode = OPCODES.TEXT
      buffer = Buffer.from(data, 'utf8')
    } else {
      console.error('暂不支持发送的数据类型')
    }
    this.doSend(opcode, buffer)
  }

  doSend(opcode, bufferDatafer) {
    this.socket.write(encodeMessage(opcode, bufferDatafer))
  }
}

module.exports = MyWebsocket
