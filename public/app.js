'use strict';

const socket = io();
const root = document.documentElement;
const count = document.querySelector('#count');
const status = document.querySelector('#status');
let hue = 225;

socket.on('ready', (message) => {
  count.textContent = message.count;
  status.textContent = `Listening for Ctrl via ${message.backend}`;
});

socket.on('ctrl-pressed', (press) => {
  hue = (hue + 47) % 360;
  root.style.setProperty('--hue', hue);
  count.textContent = press.count;
  status.textContent = `Last detected at ${new Date(press.timestamp).toLocaleTimeString()}`;

  document.body.classList.remove('pulse');
  void document.body.offsetWidth;
  document.body.classList.add('pulse');
});

socket.on('disconnect', () => {
  status.textContent = 'Listener disconnected — trying to reconnect…';
});
