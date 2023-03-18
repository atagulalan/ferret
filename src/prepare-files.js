import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { initWatchSettings } from './watch-settings.js'

function prepareFiles() {
  const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')
  if (!fs.existsSync(path.resolve(ferretFolder))) {
    log.warn(
      'It looks like you are running Ferret for the first time. We are preparing the app for you.'
    )
    fs.mkdirSync(ferretFolder)
  }

  // export nircmd.exe to win32 folder if it doesn't exist
  if (!fs.existsSync(path.resolve(ferretFolder, './nircmd.exe'))) {
    log.debug('Copying nircmd.exe to win32 folder.')
    fs.writeFileSync(
      path.resolve(ferretFolder, './nircmd.exe'),
      fs.readFileSync('assets/nircmd.exe')
    )
  }

  // export settings.json to root folder if it doesn't exist
  if (!fs.existsSync(path.resolve(ferretFolder, './settings.json'))) {
    log.debug('Creating settings.json file.')
    fs.writeFileSync(
      path.resolve(ferretFolder, './settings.json'),
      fs.readFileSync('assets/settings.json')
    )
  }

  // change working directory to ferret folder
  process.chdir(ferretFolder)

  initWatchSettings({ ferretFolder })

  return {
    settings: JSON.parse(
      fs.readFileSync(path.resolve(ferretFolder, './settings.json'), 'utf8')
    )
  }
}

export { prepareFiles }
