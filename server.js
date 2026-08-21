'use strict';

const path = require('node:path');
const http = require('node:http');
const express = require('express');
const { Server } = require('socket.io');
const { startX11Input } = require('./lib/x11-input');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let pressCount = 0;
let input;

function recordPress() {
  pressCount += 1;
  const press = { count: pressCount, timestamp: new Date().toISOString() };
  console.log(`[${press.timestamp}] Ctrl pressed (${press.count})`);
  io.emit('ctrl-pressed', press);
}

async function startNativeInput() {
  const { uIOhook, UiohookKey } = require('uiohook-napi');
  const ctrlKeys = new Set([UiohookKey.Ctrl, UiohookKey.CtrlRight]);
  uIOhook.on('keydown', (event) => {
    if (ctrlKeys.has(event.keycode)) recordPress();
  });
  uIOhook.start();
  return { name: 'uiohook', stop: () => uIOhook.stop() };
}

function selectInput() {
  const requested = process.env.INPUT_BACKEND || 'auto';
  if (requested === 'xinput' || (requested === 'auto' && process.platform === 'android')) {
    return startX11Input(recordPress);
  }
  if (requested !== 'auto' && requested !== 'uiohook') {
    throw new Error(`Unknown INPUT_BACKEND "${requested}" (use auto, uiohook, or xinput)`);
  }
  return startNativeInput();
}

io.on('connection', (socket) => {
  socket.emit('ready', { count: pressCount, backend: input?.name || 'starting' });
});

async function main() {
  try {
    input = await selectInput();
    server.listen(port, () => {
      console.log(`Ctrl display listening at http://localhost:${port}`);
      console.log(`Input backend: ${input.name}`);
    });
  } catch (error) {
    console.error(`Unable to start keyboard listener: ${error.message}`);
    process.exitCode = 1;
  }
}

function shutDown(signal) {
  console.log(`\n${signal} received; shutting down.`);
  input?.stop();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutDown('SIGINT'));
process.on('SIGTERM', () => shutDown('SIGTERM'));

main();
