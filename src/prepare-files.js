import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { initWatchSettings } from './watch-settings.js'
import { readAsset } from './asset-manager.js'

function moveAsset(file, destination) {
  fs.writeFileSync(path.resolve(destination, `./${file}`), readAsset(file))
}

function prepareFiles(initialWorkingDirectory) {
  const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')
  if (!fs.existsSync(path.resolve(ferretFolder))) {
    log.warn(
      'It looks like you are running Ferret for the first time. We are preparing the app for you.'
    )
    fs.mkdirSync(ferretFolder)
  }

  // export output.html to session folder in ferret folder
  if (!fs.existsSync(path.resolve(ferretFolder, './session/'))) {
    log.debug('Creating session folder.')
    fs.mkdirSync(path.resolve(ferretFolder, './session/'))
  }

  // export output.html to session folder in ferret folder
  // and replace if it already exists
  log.debug('Creating output.html file.')
  fs.writeFileSync(
    path.resolve(ferretFolder, './session/output.html'),
    readAsset('output.html')
  )
  fs.writeFileSync(
    path.resolve(ferretFolder, './session/qr.html'),
    readAsset('output.html')
  )

  //
  ;['nircmd.exe', 'display-switch.exe', 'hideexec.exe'].forEach((file) => {
    // export nircmd.exe to win32 folder if it doesn't exist
    if (!fs.existsSync(path.resolve(ferretFolder, `./${file}`))) {
      log.debug(`Copying ${file} to ferret folder.`)
      moveAsset(file, ferretFolder)
    }
  })

  // export settings.json to root folder if it doesn't exist
  if (
    !fs.existsSync(path.resolve('./settings.json')) &&
    !fs.existsSync(path.resolve(ferretFolder, './settings.json'))
  ) {
    log.debug('Creating settings.json file.')
    moveAsset('settings.json', ferretFolder)
  }

  // leave a copy of ferret.lnk in the root folder
  moveAsset('Ferret.lnk', ferretFolder)

  // change working directory to ferret folder
  process.chdir(ferretFolder)

  initWatchSettings({ initialWorkingDirectory, ferretFolder })
}

export { prepareFiles }
