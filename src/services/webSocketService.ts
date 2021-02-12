import WebSocket = require('ws');
const ws = new WebSocket("wss://tbtc1.trezor.io/websocket");
export default ws;