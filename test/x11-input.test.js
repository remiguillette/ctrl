'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createXi2Parser, parseCtrlKeycodes } = require('../lib/x11-input');

test('finds Ctrl keycodes in an xmodmap keyboard map', () => {
  const keycodes = parseCtrlKeycodes(`
     37         0xffe3 (Control_L)  0x0000 (NoSymbol)
    105         0xffe4 (Control_R)  0x0000 (NoSymbol)
  `);
  assert.deepEqual([...keycodes], [37, 105]);
});

test('recognizes Ctrl RawKeyPress events across chunks', () => {
  let presses = 0;
  const parse = createXi2Parser(new Set([37, 105]), () => { presses += 1; });
  parse('EVENT type 2 (RawKeyPress)\n    device: 3\n    det');
  parse('ail: 37\nEVENT type 3 (RawKeyRelease)\n    detail: 37\n');
  parse('EVENT type 2 (RawKeyPress)\n    detail: 38\n');
  parse('EVENT type 2 (RawKeyPress)\n    detail: 105\n');
  assert.equal(presses, 2);
});
