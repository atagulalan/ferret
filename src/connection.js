import path from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import express from 'express'

import { log } from './log.js'
import { addToQueue } from './send-sync.js'
import { send } from './send.js'

const PORT = process.env.PORT || 4540
const sockets = []

// module dirname hack
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const INDEX = path.join(__dirname, '../public')

// Start server
const server = express().use(express.static(INDEX)).listen(PORT)
const io = new Server(server)

function initSocketListener({ settings, username }) {
  io.on('connection', function (socket) {
    log.info('Ferret connected.')
    socket.emit('load', { settings, username })
    socket.on(0, send)
    socket.on(1, addToQueue)
    socket.on('log', (...args) => log.debug(...args))
    socket.on('disconnect', () => {
      sockets.splice(sockets.indexOf(socket), 1)
      log.info('Ferret disconnected.')
    })
    sockets.push(socket)
  })

  return { PORT }
}

export { initSocketListener, sockets }
