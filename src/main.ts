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
  reconnectLimit: null | number
}

type fn  = (value?: any) => {}


export default class WebsocketHeartbeat {
  option: optionsTypes
  ws: WebSocket
  onopen: fn
  onmessage: fn
  onreconnect: fn
  onclose: fn
  onerror: fn
  repeatCount: number
  reconnectTimer: any
  heartbeatPingTimer: any
  heartbeatPongTimer: any
  forbidenHeartbeat: boolean
  constructor({
    url,
    pingChat = 'heartbeat',
    pingTime = 20 * 1000,
    pongTime = 10 * 1000,
    reconnetTime = 4000,
    reconnectLimit = null
  }) {
    this.option = {
      url,
      pingChat,
      pingTime,
      pongTime,
      reconnetTime,
      reconnectLimit
    }
    this.repeatCount = 0
    this.forbidenHeartbeat = false;
    this.init();
  }
  init() {
    try {
      this.ws = new WebSocket(this.option.url)
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
      this._checkHeartbeat();
    };
    this.ws.onmessage = (event) => {
      this.onmessage && this.onmessage(event);
      this._checkHeartbeat();
    };
  }
  reconnect() {
    if (this.option.reconnectLimit !== null && this.option.reconnectLimit <= this.repeatCount) return;
    if (this.forbidenHeartbeat) return;
    this.repeatCount++;
    this.onreconnect();
    //没连接上会一直重连，设置延迟避免请求过多
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
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