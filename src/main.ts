type optionsTypes = {
  url: string
  // 每隔一段时间给服务器发送的消息
  pingChat: any
  // 间隔时间
  pingTime: number
  // 等待服务器响应的时间
  pongTime: number 
  // 重连间隔
  reconnetTime: number
  // 重连次数
  reconnectCount: null | number,
  // ws是否自动增加时间戳
  timestamp: boolean
}

type fn  = (value?: any) => {}


export default class WebsocketHeartbeat {
  option: optionsTypes
  ws: WebSocket
  // ws打开
  onopen?: fn
  // 收到消息
  onmessage?: fn
  // 重连
  onreconnect?: fn
  // 连接关闭
  onclose?: fn
  // 出错
  onerror?: fn
  // 连接结束
  onend?: fn
  // 重连次数
  limit: number
  // 重连的间隔时间
  reconnectTimer: any
  // 未收到消息，向服务器发送请求的间隔时间
  heartbeatPingTimer: any
  // 发送请求后，等待服务器响应的间隔时间
  heartbeatPongTimer: any
  // 如果主动关闭socket就不再重连
  forbidenHeartbeat: boolean
  constructor({
    url,
    pingChat = 'heartbeat',
    pingTime = 20 * 1000,
    pongTime = 10 * 1000,
    reconnetTime = 4000,
    reconnectCount = null,
    timestamp = true
  }) {
    this.option = {
      url,
      pingChat,
      pingTime,
      pongTime,
      reconnetTime,
      reconnectCount,
      timestamp
    }
    this.limit = 0
    this.forbidenHeartbeat = false;
    this.init();
  }
  init() {
    try {
      const url = this.option.url + (this.option.timestamp ? `?t=${Date.now()}` : '')
      this.ws = new WebSocket(url)
      this.initEventHandle()
    } catch (error) {
      this.reconnect()
      throw error
    }
  }
  initEventHandle() {
    this.ws.onclose = (value) => {
      this.onclose && this.onclose(value);
      this.reconnect();
    };
    this.ws.onerror = (value) => {
      this.onerror && this.onerror(value);
      this.reconnect();
    };
    this.ws.onopen = (value) => {
      this.onopen && this.onopen(value);
      // 开始心跳检测
      this._checkHeartbeat();
    };
    this.ws.onmessage = (event) => {
      this.onmessage && this.onmessage(event);
      // 收到消息，连接正常，重置心跳检测
      this._checkHeartbeat();
    };
  }
  reconnect() {
    if (this.option.reconnectCount !== null && this.option.reconnectCount <= this.limit) {
      return this.onend && this.onend('Reconnection has exceeded the maximum limit')
    }
    // 如果主动关闭socket就不再重连
    if (this.forbidenHeartbeat) return;
    // 没连接上会一直重连，设置延迟避免请求过多
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.limit++;
      this.onreconnect();
      this.init();
    }, this.option.reconnetTime);
  }
  send(value: any) {
    if (!this.ws) throw Error('webscoket init error');
    if (this.ws.readyState === 1) {
      this.ws.send(value);
    }
  }
  close() {
    this._clearHeartbeatTimer();
    // 如果主动关闭socket就不再重连
    this.forbidenHeartbeat = true;
    this.ws && this.ws.close();
  }
  _startHeartbeat() {
    if (this.forbidenHeartbeat) return;
    // 每隔一段时间像服务器发送数据
    this.heartbeatPingTimer = setTimeout(() => {
      this.send(this.option.pingChat);
      // 在规定时间内，监听服务端响应，未响应则关闭ws
      this.heartbeatPongTimer = setTimeout(() => {
        this.ws && this.ws.close();
      }, this.option.pongTime);
    }, this.option.pingTime)
  }
  _clearHeartbeatTimer() {
    clearTimeout(this.heartbeatPingTimer);
    clearTimeout(this.heartbeatPongTimer);
  }
  _checkHeartbeat() {
    this._clearHeartbeatTimer();
    this._startHeartbeat();
  }
}