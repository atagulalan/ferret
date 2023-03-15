import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { showIPs } from './src/ip.js'
import { initTaskbarInterval } from './src/taskbar.js'
import { getUsername } from './src/username.js'
import { addToQueue } from './src/send-sync.js'
import { initWatchSettings } from './src/watch-settings.js'
import { send } from './src/send.js'
import { Server } from 'socket.io'
import express from 'express'

// module dirname hack
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 4540
const INDEX = path.join(__dirname, './public')

// Start server
const server = express().use(express.static(INDEX)).listen(PORT)
const io = new Server(server)

const sockets = []
const username = await getUsername()

// export nircmd.exe to win32 folder if it doesn't exist
if (!fs.existsSync('./win32/nircmd.exe')) {
  if (!fs.existsSync('./win32')) fs.mkdirSync('./win32')
  fs.writeFileSync('./win32/nircmd.exe', fs.readFileSync('assets/nircmd.exe'))
}

// export settings.json to root folder if it doesn't exist
if (!fs.existsSync('./settings.json')) {
  fs.writeFileSync('./settings.json', fs.readFileSync('assets/settings.json'))
}

const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'))
const DEBUG = settings.debug || false

io.on('connection', function (socket) {
  DEBUG && console.log('ferret connected.')
  socket.emit('load', { settings, username })
  socket.on(0, send)
  socket.on(1, addToQueue)
  socket.on('log', (...args) => DEBUG && console.log(...args))
  socket.on('disconnect', () => DEBUG && console.log('ferret disconnected.'))
  sockets.push(socket)
})

initTaskbarInterval({
  sockets,
  ignoredProcessNames: ['Rainmeter', 'NVIDIA Share']
})
initWatchSettings()

//Show IP's and ports to user
showIPs(PORT)
