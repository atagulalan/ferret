import path from 'path'
import { Server } from 'socket.io'
import express from 'express'
import util from 'util'
import { execFile } from 'child_process'

import { log } from './log.js'
import { sendSync } from './send-sync.js'
import { send } from './send.js'

import { settings } from './watch-settings.js'
import { uploadFile } from './upload.js'
import { startRecording, stopRecording } from './screen.js'
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
  .on('error', () => {
    const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')
    const execPromise = util.promisify(execFile)
    execPromise(
      path.resolve(ferretFolder, './nircmd.exe'),
      [
        'infobox',
        'Port 4540 is already in use.\nIs there another Ferret running?',
        "Couldn't start Ferret"
      ],
      {
        cwd: ferretFolder
      }
    ).then(() => {
      process.exit(1)
    })
  })

const io = new Server(server, {
  maxHttpBufferSize: 1e10
})

function initSocketListener({ username, width, height }) {
  io.on('connection', function (socket) {
    log.info('Ferret connected.')
    socket.emit('load', { settings, username, width, height })
    socket.on(0, send)
    socket.on(1, sendSync)
    socket.on(2, sendTaskbar)
    socket.on(3, uploadFile)
    socket.on(4, startRecording)
    socket.on(5, stopRecording)
    socket.on('log', (...args) => log.debug(...args))
    socket.on('disconnect', () => {
      sockets.splice(sockets.indexOf(socket), 1)
      stopRecording()
      log.info('Ferret disconnected.')
    })
    sockets.push(socket)
  })

  return { port: PORT }
}

export { initSocketListener, sockets }
