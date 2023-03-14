const execFile = require('util').promisify(require('child_process').execFile)
const { showIPs } = require('./src/ip')
const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const fs = require('fs')

const PORT = process.env.PORT || 4540
const INDEX = path.join(__dirname, './public')

// Start server
const server = express().use(express.static(INDEX)).listen(PORT)

const io = socketIO(server)

// export nircmd.exe to win32 folder if it doesn't exist
if (!fs.existsSync('./win32/nircmd.exe')) {
  if (!fs.existsSync('./win32')) fs.mkdirSync('./win32')
  fs.writeFileSync('./win32/nircmd.exe', fs.readFileSync('assets/nircmd.exe'))
}
if (!fs.existsSync('./settings.json')) {
  fs.writeFileSync('./settings.json', fs.readFileSync('assets/settings.json'))
}

// check if settings file exists
// if not, create it
if (!fs.existsSync('./settings.json')) {
  fs.writeFileSync(
    './settings.json',
    JSON.stringify({
      design: ['no-settings'],
      blocks: [
        {
          name: 'no-settings',
          text: 'You need to set up your settings.json file. See the README for more info.',
          tag: 'div'
        }
      ]
    })
  )
}

const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'))
const DEBUG = settings.debug || false

const conversions = {
  mouse: {
    command: 'sendmouse'
  },
  volume: {
    command: 'changesysvolume',
    argConverter: (...args) => {
      return args.map((arg, i) => {
        if (i === 0) {
          return arg * 655
        }
        return arg
      })
    }
  },
  key: {
    command: 'sendkey'
  },
  press: {
    command: 'sendkeypress'
  }
}

let executeLock = false
const commandQueue = []

function addToQueue(...commands) {
  commands.forEach((command, i) => {
    commandQueue.push({
      status: 'pending',
      id: +new Date() + '-' + i,
      command
    })
  })
}

async function sendSync(...items) {
  if (items.every(({ command }) => !command)) return

  // if already looping through command queue, add to queue
  if (executeLock) return
  executeLock = true

  for (let { command, id } of items) {
    // convert main command
    const [mainCommand, ...args] = command.split(' ')
    const { command: convertedCommand, argConverter } =
      conversions[mainCommand] || {}
    console.log('EXECUTING', command)

    try {
      // change status
      commandQueue.find(({ id: i }) => i === id).status = 'executing'
      const eCmd = convertedCommand || mainCommand
      const eArgs = argConverter ? argConverter(...args) : args
      await execFile('./win32/nircmd.exe', [eCmd, ...eArgs])
      console.log('DONE.')
      // remove from queue
      commandQueue.splice(
        commandQueue.findIndex(({ id: i }) => i === id),
        1
      )
    } catch (e) {
      // An error ocurred attempting to execute the script
      console.log('error executing script:', command)
      console.error(e)
    }
  }
  executeLock = false
}

// loop through command queue
setInterval(() => {
  if (!executeLock) {
    sendSync(...commandQueue.filter(({ status }) => status === 'pending'))
  }
}, 1)

// send
function send(...commands) {
  if (commands.every((command) => !command)) return

  for (let command of commands) {
    console.log(command)
    // convert main command
    const [mainCommand, ...args] = command.split(' ')
    const { command: convertedCommand, argConverter } =
      conversions[mainCommand] || {}

    try {
      const eCmd = convertedCommand || mainCommand
      const eArgs = argConverter ? argConverter(...args) : args
      execFile('./win32/nircmd.exe', [eCmd, ...eArgs])
    } catch (e) {
      // An error ocurred attempting to execute the script
      console.log('error executing script:', command)
      console.error(e)
    }
  }
}

io.on('connection', function (socket) {
  socket.on('join', function (ferret) {
    DEBUG && console.log(ferret + ' connected.')
    socket.join(ferret)
    socket.emit('load', settings)
    socket.on(0, send)
    socket.on(1, addToQueue)
    socket.on('log', (...args) => DEBUG && console.log(...args))
    socket.on('disconnect', function () {
      DEBUG && console.log(ferret + ' disconnected.')
    })
  })
})

//Show IP's and ports to user
showIPs(PORT)
