'use strict';

const { execFile, spawn } = require('node:child_process');

const DEFAULT_CTRL_KEYCODES = new Set([37, 105]);

function parseCtrlKeycodes(output) {
  const keycodes = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!/\bControl_(?:L|R)\b/.test(line)) continue;
    const match = line.match(/^\s*(\d+)\s+/);
    if (match) keycodes.add(Number(match[1]));
  }
  return keycodes.size ? keycodes : new Set(DEFAULT_CTRL_KEYCODES);
}

function createXi2Parser(ctrlKeycodes, onPress) {
  let buffer = '';
  let rawKeyPress = false;

  return (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();

    for (const line of lines) {
      const event = line.match(/^EVENT type \d+ \(([^)]+)\)/);
      if (event) {
        rawKeyPress = event[1] === 'RawKeyPress';
        continue;
      }
      const detail = line.match(/^\s*detail:\s*(\d+)/);
      if (rawKeyPress && detail && ctrlKeycodes.has(Number(detail[1]))) {
        onPress();
        rawKeyPress = false;
      }
    }
  };
}

function getCtrlKeycodes() {
  return new Promise((resolve) => {
    execFile('xmodmap', ['-pk'], { encoding: 'utf8' }, (error, stdout) => {
      resolve(error ? new Set(DEFAULT_CTRL_KEYCODES) : parseCtrlKeycodes(stdout));
    });
  });
}

async function startX11Input(onPress) {
  if (!process.env.DISPLAY) {
    throw new Error('DISPLAY is not set. Start Termux:X11 and export DISPLAY (usually :0) first.');
  }

  const keycodes = await getCtrlKeycodes();
  const child = spawn('xinput', ['test-xi2', '--root'], { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', createXi2Parser(keycodes, onPress));

  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });

  await new Promise((resolve, reject) => {
    child.once('spawn', resolve);
    child.once('error', (error) => {
      reject(new Error(`Could not start xinput: ${error.message}. Install it with "pkg install xorg-xinput".`));
    });
  });

  child.on('exit', (code, signal) => {
    if (code && !child.killed) {
      console.error(`xinput stopped (${code}${signal ? `, ${signal}` : ''}): ${stderr.trim()}`);
    }
  });

  return {
    name: 'XInput 2 (Termux:X11)',
    stop() { if (!child.killed) child.kill(); },
  };
}

module.exports = { createXi2Parser, parseCtrlKeycodes, startX11Input };
