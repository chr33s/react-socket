import { EventEmitter } from 'events'

const SOCKET = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

/*
 * props{uri,get(),set()}
 */

export default class Socket extends EventEmitter {
  constructor (props) {
    super()

    this.socket = null
    this.attempts = 0
    this.queue = {}
    this.uri = typeof props === 'string' ? props : props.uri

    this._connect()
  }

  _id = () => {
    return Math.random().toString(16).substr(2, 8)
  }

  _onOpen = () => {
    this.attempts = 0
    this.emit('open')
  }

  _onMessage = (event) => {
    const m = JSON.parse(event.data)
    if (m.id in this.queue) {
      const callback = this.queue[m.id]
      if (typeof callback === 'function') {
        callback(m.params)
      }
      delete this.queue[m.id]
    } else {
      this.emit(m.method, m.params)
    }
    this.emit('message', event)
  }

  _connect = () => {
    this.attempts++

    this.socket = new window.WebSocket(this.uri)
    this.socket.onopen = this._onOpen
    this.socket.onmessage = this._onMessage
    this.socket.onclose = this._onClose
    this.socket.onerror = this._onError
  }

  _check = () => {
    if (this.socket && this.socket.readyState !== SOCKET.CLOSED) return

    this._connect()
  }

  _reconnect = () => {
    setTimeout(this._check, this._interval())
  }

  _interval = () => {
    return Math.min(300, (Math.pow(2, this.attempts) - 1)) * 100
  }

  _onClose = (code, reason) => {
    this.socket = null
    this._reconnect()
    this.emit('close', code, reason)
  }

  _onError = (event) => {
    this.emit('error', event.toString())
  }

  send = (method, params, callback) => {
    try {
      if (!this.socket || this.socket.readyState !== SOCKET.OPEN) {
        throw new Error()
      }
      const id = this._id()
      if (typeof callback === 'function') {
        this.queue[id] = callback
      }
      this.socket.send(JSON.stringify({id, method, params}))
    } catch (e) {
      setTimeout(() => {
        this.send(method, params, callback)
      }, 500)
    }
  }

  close = () => {
    this.socket.close()
  }
}

global.Socket = Socket
