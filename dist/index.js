(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WebsocketConnection = /** @class */ (function () {
    function WebsocketConnection(_a) {
        var url = _a.url, _b = _a.pingChat, pingChat = _b === void 0 ? 'heartbeat' : _b, _c = _a.pingTime, pingTime = _c === void 0 ? 15000 : _c, _d = _a.pongTime, pongTime = _d === void 0 ? 10000 : _d, _e = _a.reconnetTime, reconnetTime = _e === void 0 ? 4000 : _e, _f = _a.reconnectLimit, reconnectLimit = _f === void 0 ? null : _f;
        this.option = {
            url: url,
            pingChat: pingChat,
            pingTime: pingTime,
            pongTime: pongTime,
            reconnetTime: reconnetTime,
            reconnectLimit: reconnectLimit
        };
        this.repeatCount = 0;
        this.forbidenHeartbeat = false;
        this.init();
    }
    WebsocketConnection.prototype.init = function () {
        try {
            this.ws = new WebSocket(this.option.url);
            this.initEventHandle();
        }
        catch (error) {
            this.reconnect();
            throw error;
        }
    };
    WebsocketConnection.prototype.initEventHandle = function () {
        var _this = this;
        this.ws.onclose = function (value) {
            _this.onclose(value);
            _this.reconnect();
        };
        this.ws.onerror = function (value) {
            _this.onerror(value);
            _this.reconnect();
        };
        this.ws.onopen = function (value) {
            _this.onopen(value);
            _this._checkHeartbeat();
        };
        this.ws.onmessage = function (event) {
            _this.onmessage(event);
            _this._checkHeartbeat();
        };
    };
    WebsocketConnection.prototype.reconnect = function () {
        var _this = this;
        if (this.option.reconnectLimit !== null && this.option.reconnectLimit <= this.repeatCount)
            return;
        if (this.forbidenHeartbeat)
            return;
        this.repeatCount++;
        this.onreconnect();
        //没连接上会一直重连，设置延迟避免请求过多
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(function () {
            _this.init();
        }, this.option.reconnetTime);
    };
    WebsocketConnection.prototype.send = function (value) {
        if (!this.ws)
            throw Error('webscoket init error');
        if (this.ws.readyState === 1) {
            this.ws.send(value);
        }
    };
    WebsocketConnection.prototype.close = function () {
        this._clearHeartbeatTimer();
        this.forbidenHeartbeat = true;
        this.ws && this.ws.close();
    };
    WebsocketConnection.prototype._startHeartbeat = function () {
        var _this = this;
        if (this.forbidenHeartbeat)
            return;
        // 每隔一段时间像服务器发送数据
        this.heartbeatPingTimer = setTimeout(function () {
            _this.send(_this.option.pingChat);
            // 在规定时间内，监听服务端响应，未响应则关闭ws
            _this.heartbeatPongTimer = setTimeout(function () {
                _this.ws && _this.ws.close();
            }, _this.option.pongTime);
        }, this.option.pingTime);
    };
    WebsocketConnection.prototype._clearHeartbeatTimer = function () {
        clearTimeout(this.heartbeatPingTimer);
        clearTimeout(this.heartbeatPongTimer);
    };
    WebsocketConnection.prototype._checkHeartbeat = function () {
        this._clearHeartbeatTimer();
        this._startHeartbeat();
    };
    return WebsocketConnection;
}());
exports.default = WebsocketConnection;


/***/ })
/******/ ]);
});