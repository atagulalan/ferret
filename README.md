# ferret

🐭 Simple mouse mover (and keyboard presser now)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system. This program only works on Windows.

### Prerequisites

You need [NodeJS](https://nodejs.org/en/download/) on your computer.

### Installing

You need to install npm packages before continuing

```
npm install
```

after you install packages, all you need to do is

```
npm start
```

and it would print a table of your IPv4 adresses. By default, it'll run at [4540](https://eksisozluk.com/4540-merkez--3607686) port.

```
┌──────────────────────────────┬─────────────────────────────┐
│ VirtualBox Host-Only Network │ 192.168.56.1:4540           │
├──────────────────────────────┼─────────────────────────────┤
│ Ethernet                     │ 192.168.1.11:4540           │
├──────────────────────────────┼─────────────────────────────┤
│                              │ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ │
│                              │ █ ▄▄▄▄▄ ██▄▄ ▀▄██▄█ ▄▄▄▄▄ █ │
│                              │ █ █   █ █▀▄  █▀ ▀ █ █   █ █ │
│                              │ █ █▄▄▄█ █▄▀ █▄█▄█▀█ █▄▄▄█ █ │
│                              │ █▄▄▄▄▄▄▄█▄▀▄█ █ █▄█▄▄▄▄▄▄▄█ │
│                              │ █  ▀█▀▄▄ ▀▄ █▄ █  ▀██  ▀▀██ │
│                              │ █▀▄ █▀▄▄▀▄▄▀ ▄▄█ ▀█▄▄▀ █▄ █ │
│                              │ █▀ ▀▄█▄▄ ▀▄ █▀█ ▀▄▄▄████▀▄█ │
│                              │ █ █▄▄█▀▄▀█▀ █▀█ ▄▀▄█▄▀▄▀▄ █ │
│                              │ █▄█▄▄█▄▄▄ ▄▄█▄▄▀▀ ▄▄▄ █ ███ │
│                              │ █ ▄▄▄▄▄ █  █▀▄▄▀█ █▄█ ▄██ █ │
│                              │ █ █   █ ██▄█▄ ▄█▄▄▄  ▄ ▄▀▀█ │
│                              │ █ █▄▄▄█ █▀█▄█ █▄▀▀▄▀▀▀█▄█ █ │
│                              │ █▄▄▄▄▄▄▄█▄██▄██▄▄▄█▄██▄██▄█ │
│                              │                             │
└──────────────────────────────┴─────────────────────────────┘
```

You can connect this address with your phone's browser and start moving your cursor with your phone.
(It must be connected to the same network as your PC)

Have fun!

## Settings File

You can change settings by editing settings.json file. If no settings.json file is found, it'll create one with default settings in AppData.

Ferret prioritizes settings.json file in the same directory as the executable. If it can't find one, it'll use the one in AppData.

## Debug Levels

You can change debug level by changing "debug" variable in settings.json file.

Debug levels can be:

- "error" (1)
- "warn" (2)
- "info" (default) (3)
- "debug" (4)
- "silly" (5)

## Built With

- [NodeJS](https://nodejs.org/en/) - JavaScript runtime built on Chrome's V8 JavaScript engine

## Authors

- **Ata Gülalan** - _Initial work_ - [atagulalan](https://github.com/atagulalan)

## License

This section can be found in LICENSE file.
