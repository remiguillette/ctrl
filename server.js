'use strict';

const path = require('node:path');
const http = require('node:http');
const express = require('express');
const { Server } = require('socket.io');
const { uIOhook, UiohookKey } = require('uiohook-napi');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const ctrlKeys = new Set([UiohookKey.Ctrl, UiohookKey.CtrlRight]);
let pressCount = 0;

uIOhook.on('keydown', (event) => {
  if (!ctrlKeys.has(event.keycode)) return;

  pressCount += 1;
  const press = { count: pressCount, timestamp: new Date().toISOString() };
  console.log(`[${press.timestamp}] Ctrl pressed (${press.count})`);
  io.emit('ctrl-pressed', press);
});

io.on('connection', (socket) => {
  socket.emit('ready', { count: pressCount });
});

server.listen(port, () => {
  console.log(`Ctrl display listening at http://localhost:${port}`);
  uIOhook.start();
});

function shutDown(signal) {
  console.log(`\n${signal} received; shutting down.`);
  uIOhook.stop();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutDown('SIGINT'));
process.on('SIGTERM', () => shutDown('SIGTERM'));
