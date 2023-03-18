import fs from 'fs'
import path from 'path'
import { log } from './log.js'
import { sockets } from './connection.js'

export function initWatchSettings({ ferretFolder }) {
  // Look for settings.json changes
  fs.watchFile(path.resolve(ferretFolder, './settings.json'), (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      try {
        const newSettings = JSON.parse(
          fs.readFileSync(path.resolve(ferretFolder, './settings.json'), 'utf8')
        )
        sockets.forEach((socket) =>
          socket.emit('load', { settings: newSettings })
        )
        log.info('Settings updated.')
      } catch (error) {
        log.error('Loading settings failed.', error)
      }
    }
  })
}
