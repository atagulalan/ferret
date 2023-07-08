import { bring } from './run.js'
import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { settings } from './watch-settings.js'
import { readAsset } from './asset-manager.js'

async function installRoutine() {
  // if standalone is enabled, it means do not try to hide the console
  if (settings.standalone) {
    // do nothing
    return
  }

  // if hide console is not enabled, it means its on installation mode
  if (!process.argv.includes('--standalone')) {
    // copy ferret.exe to appdata folder
    try {
      fs.writeFileSync(
        path.resolve(process.env.APPDATA, './ferret/ferret.exe'),
        fs.readFileSync(process.execPath)
      )
    } catch (e) {
      log.error('Cannot copy ferret.exe to appdata folder.')
      log.error(process.execPath)
      process.exit(1)
    }

    log.info('New version installed. Restarting...')

    // run hideexec.exe to hide the console
    await bring('hideexec.exe', [
      'ferret.exe',
      '--standalone',
      '--remove-installer',
      process.execPath
    ])
    // exit the process
    process.exit()
  }

  // if hide console is enabled, it means its on normal mode.
  // check if it needs to replace the original ferret.exe
  // it probably means that the user is updating the app (or reinstalling)
  if (process.argv.includes('--remove-installer')) {
    log.info('Removing installer...')
    // replace the original ferret.exe with the placeholder caller
    const caller = process.argv[process.argv.indexOf('--remove-installer') + 1]
    // validate if caller exists
    if (!fs.existsSync(path.resolve(caller))) {
      log.error('Caller does not exist. Continuing...')
    }
    // copy link to desktop
    fs.writeFileSync(
      // desktop folder
      path.resolve(process.env.USERPROFILE, './Desktop/Ferret.lnk'),
      readAsset('Ferret.lnk')
    )
    // try to delete the original ferret.exe
    try {
      fs.unlinkSync(caller)
    } catch (e) {
      // if it fails, it means that the original ferret.exe is not the original ferret.exe
      log.error('Cannot delete the original ferret.exe.')
    }
  }
}

export { installRoutine }
