# X11 Ctrl listener

A small Node.js app that listens for global left or right **Ctrl** key presses on
an X11 Linux desktop. Every press is printed in the terminal and sent to the
browser, where it changes the page color and increments a counter.

## Requirements

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

The native keyboard hook may require X11 development/runtime libraries supplied
by your distribution. If `$XDG_SESSION_TYPE` reports `wayland`, log in using an
X11/Xorg session before running the listener.
