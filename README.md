# react-socket

A universal react library for websockets.

## features

- **super simple** API for working with WebSockets

## install

`npm i -S @chr33s/react-socket`

## usage

```js
//- <script src='/dist/socket.min.js'></script>
const Socket = require('@chr33s/react-socket')

const socket = new Socket('ws://echo.websocket.org')
socket.on('open', () => {
  // socket is connected!
  socket.send('ping', 'server', data => {
    // ping sent!
    console.log('sent', data)
  })
})

socket.on('ping', data => {
  // ping recieved!
  console.log('recieved:', data)
})
```

## api

### `socket = new Socket(uri)`

Create a new WebSocket connection to the server at `uri`.

### `socket.send(method, params, callback)`

Send data to the WebSocket server. `data` can be of [String,JSON] type.

### `socket.on(method, callback(params))`

Received a message from the WebSocket server.

### `socket.close()`

Close the connection to the WebSocket server.

## license

MIT. Copyright (c) [chr33s](https://github.com/chr33s).
