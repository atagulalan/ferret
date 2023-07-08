import path from 'path'
import { Server } from 'socket.io'
import express from 'express'

import { log } from './log.js'
import { sendSync } from './send-sync.js'
import { send } from './send.js'

import { settings } from './watch-settings.js'
import { sendTaskbar } from './taskbar.js'
import { getDirname } from './asset-manager.js'

const PORT = process.env.PORT || 4540
const sockets = []

const getPublicDirectory = () => {
  return path.join(getDirname(), './public')
}

const getSessionDirectory = () => {
  return path.resolve(process.env.APPDATA, './ferret/', './session')
}

const PUBLIC = path.join(getPublicDirectory())
const SESSION = path.join(getSessionDirectory())

// Start server
const server = express()
  .use(express.static(PUBLIC))
  .use(express.static(SESSION))
  .listen(PORT)
const io = new Server(server)

function initSocketListener({ username }) {
  io.on('connection', function (socket) {
    log.info('Ferret connected.')
    socket.emit('load', { settings, username })
    socket.on(0, send)
    socket.on(1, sendSync)
    socket.on(2, sendTaskbar)
    socket.on('log', (...args) => log.debug(...args))
    socket.on('disconnect', () => {
      sockets.splice(sockets.indexOf(socket), 1)
      log.info('Ferret disconnected.')
    })
    sockets.push(socket)
  })

  return { port: PORT }
}

export { initSocketListener, sockets }
