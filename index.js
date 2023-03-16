import path from 'path'
import { fileURLToPath } from 'url'
import { log, setDebugLevel } from './src/log.js'
import { showIPs } from './src/ip.js'
import { initTaskbarInterval } from './src/taskbar.js'
import { getUsername } from './src/username.js'
import { addToQueue } from './src/send-sync.js'
import { send } from './src/send.js'
import { prepareFiles } from './src/prepare-files.js'
import { Server } from 'socket.io'
import express from 'express'

// module dirname hack
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 4540
const INDEX = path.join(__dirname, './public')

// Start server
const server = express().use(express.static(INDEX)).listen(PORT)
const io = new Server(server)

const { settings } = prepareFiles()
setDebugLevel(settings.debug || 'info')

const sockets = []
const username = await getUsername()

io.on('connection', function (socket) {
  log.info('Ferret connected.')
  socket.emit('load', { settings, username })
  socket.on(0, send)
  socket.on(1, addToQueue)
  socket.on('log', (...args) => log.debug(...args))
  socket.on('disconnect', () => log.info('Ferret disconnected.'))
  sockets.push(socket)
})

initTaskbarInterval({
  sockets,
  ignoredProcessNames: ['Rainmeter', 'NVIDIA Share']
})

//Show IP's and ports to user
showIPs(PORT)
