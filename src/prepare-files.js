import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { initWatchSettings } from './watch-settings.js'

function prepareFiles(initialWorkingDirectory) {
  const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')
  if (!fs.existsSync(path.resolve(ferretFolder))) {
    log.warn(
      'It looks like you are running Ferret for the first time. We are preparing the app for you.'
    )
    fs.mkdirSync(ferretFolder)
  }

  ;['nircmd.exe', 'display-switch.exe', 'hideexec.exe'].forEach((file) => {
    // export nircmd.exe to win32 folder if it doesn't exist
    if (!fs.existsSync(path.resolve(ferretFolder, `./${file}`))) {
      log.debug(`Copying ${file} to ferret folder.`)
      fs.writeFileSync(
        path.resolve(ferretFolder, `./${file}`),
        fs.readFileSync(`assets/${file}`)
      )
    }
  })

  // export settings.json to root folder if it doesn't exist
  if (
    !fs.existsSync(path.resolve('./settings.json')) &&
    !fs.existsSync(path.resolve(ferretFolder, './settings.json'))
  ) {
    log.debug('Creating settings.json file.')
    fs.writeFileSync(
      path.resolve(ferretFolder, './settings.json'),
      fs.readFileSync('assets/settings.json')
    )
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
    fs.readFileSync('assets/output.html')
  )
  fs.writeFileSync(
    path.resolve(ferretFolder, './session/qr.html'),
    fs.readFileSync('assets/output.html')
  )

  // change working directory to ferret folder
  process.chdir(ferretFolder)

  initWatchSettings({ initialWorkingDirectory, ferretFolder })
}

export { prepareFiles }
