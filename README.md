# WebSocketHeartbeat

这是一个基于websocket的封装，可以支持心跳和重新连接javascript库，在某些特殊情况下，链接断开，将自动重新连接并确保心跳协议。


# 安装

NPM

```javascript
npm install websocket-heartbeat-reconnection --save
或着
npm install websocket-heartbeat-reconnection -S
//将依赖加入到dependencies（生产阶段的依赖）
```
YARN

```javascript
yarn add websocket-heartbeat-reconnection --save
或着
yarn add websocket-heartbeat-reconnection -S
```

# 使用
```javascript
import WebsocketHeartbeat from 'websocket-heartbeat-reconnection'
let ws = new WebsocketHeartbeat({
    url: 'xxxxxxx'//链接地址
})
ws.onopen = () => {
  console.log('连接成功')
}
ws.onmessage = () => {
  console.log('接受到消息')
}
ws.onreconnect = () => {
  console.log('正在重新连接')
}
ws.onerror = () => {
  console.log('error')
}
```
# 参数

## Options

#### `url`
- This is the URL of websocket
- Accepts `String`
  
### `pingChat`
- 这是websocket心跳协议内容
- Accepts `any`
- Default `heartbeat`

#### `pingTime`
- 这是websocket心跳协议时间
- Accepts `Number`
- Default: `20000`

#### `pongTime`
- 这是websocket ping后未收到消息的超时时间
- Accepts `Number`
- Default: `10000`

#### `reconnetTime`
- 这是websocket重新连接时间
- Accepts `Number`
- Default: `2000`

#### `reconnectLimit`
- 这是websocket重连的次数
- Accepts `Null or Number`
- Default: `null`

---

## API

### onopen
```javascript
WebsocketComplete.onopen = () => {
    console.log('连接成功')
}
```

### onerror
```javascript
WebsocketComplete.onerror = () => {
    console.log('连接失败')
}
```

### onclose
```javascript
WebsocketComplete.onclose = () => {
    console.log('连接断开')
}
```

### onmessage
```javascript
WebsocketComplete.onmessage = () => {
    console.log('获取消息')
}
```

### onreconnect
```javascript
WebsocketComplete.onreconnect = () => {
    console.log('重新连接')
}
```
