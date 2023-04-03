import fs from 'fs'
import path from 'path'
import { log } from './log.js'
import { sockets } from './connection.js'

let settings = {}

function initWatchSettings({ initialWorkingDirectory, ferretFolder }) {
  const filePaths = [
    path.resolve(initialWorkingDirectory, './settings.json'),
    path.resolve(ferretFolder, './settings.json')
  ]

  const getSettings = () => {
    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        log.debug(`Found settings file at ${filePath}`)
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    }
    log.error('Settings file not found.')
    return {}
  }

  const watchFileCallback = (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      try {
        settings = getSettings()
        sockets.forEach((socket) => socket.emit('load', { settings }))
        log.info('Settings updated.')
      } catch (error) {
        log.error('Loading settings failed.', error)
      }
    }
  }

  // Look for settings.json changes
  filePaths.forEach((filePath) => fs.watchFile(filePath, watchFileCallback))

  settings = getSettings()
}

export { initWatchSettings, settings }
