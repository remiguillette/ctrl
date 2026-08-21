# X11 Ctrl listener

A small Node.js app that listens for global left or right **Ctrl** key presses on
an X11 Linux desktop. Every press is printed in the terminal and sent to the
browser, where it changes the page color and increments a counter.

## Desktop Linux

- Linux running an X11 session (not a native Wayland session)
- Node.js 18 or newer
- A working X display available through the `DISPLAY` environment variable

## Run

```bash
npm install
npm start
```

Open <http://localhost:3000>, then press either Ctrl key in any application.
Set `PORT` to use a different port, for example `PORT=8080 npm start`.

The optional native keyboard hook may require X11 development/runtime libraries supplied
by your distribution. If `$XDG_SESSION_TYPE` reports `wayland`, log in using an
X11/Xorg session before running the listener.

## Android with Termux:X11

The Android build of Node cannot load `uiohook-napi`'s Linux native binary. This
project therefore installs it as an optional dependency and automatically uses
the XInput 2 command-line backend when Node reports `platform=android`.

In Termux, install the packages and project dependencies:

```bash
pkg update
pkg install x11-repo
pkg install nodejs xorg-xinput xorg-xmodmap
npm install
```

Start the Termux:X11 app/server as usual, then in the same Termux environment:

```bash
export DISPLAY=:0  # use the display selected by your Termux:X11 setup
npm start
```

Open `http://localhost:3000` in Android's browser, or in a browser running under
Termux:X11. The listener observes keys delivered through that X server; Android
keys outside Termux:X11 are not visible to an ordinary Termux process.

Set `INPUT_BACKEND=xinput` to use the portable X11 backend on desktop Linux too,
or `INPUT_BACKEND=uiohook` to explicitly request the native module.
