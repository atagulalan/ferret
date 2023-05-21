import { bring } from './run.js'
import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { settings } from './watch-settings.js'

async function hideConsole() {
  // if standalone is enabled, it means do not try to hide the console
  if (settings.standalone) {
    // do nothing
    return
  }

  log.info(settings)

  // if hide console is not enabled, it means its on installation mode
  if (!process.argv.includes('--hide-console')) {
    // copy ferret.exe to appdata folder
    try {
      fs.writeFileSync(
        path.resolve(process.env.APPDATA, './ferret/ferret.exe'),
        fs.readFileSync(process.execPath)
      )
    } catch (e) {
      log.error('Cannot copy ferret.exe to appdata folder.')
      process.exit(1)
    }

    // run hideexec.exe to hide the console
    bring('hideexec', [
      'ferret.exe',
      '--hide-console',
      '--replace-with',
      process.execPath
    ])
    // exit the process
    process.exit()
  }

  // if hide console is enabled, it means its on normal mode.
  // check if it needs to replace the original ferret.exe
  // it probably means that the user is updating the app (or reinstalling)
  if (process.argv.includes('--replace-with')) {
    // replace the original ferret.exe with the placeholder caller
    const caller = process.argv[process.argv.indexOf('--replace-with') + 1]
    // validate if caller exists
    if (!fs.existsSync(path.resolve(caller))) {
      log.error('Caller does not exist.')
      process.exit(1)
    }
    // copy link to desktop
    fs.writeFileSync(
      // desktop folder
      path.resolve(process.env.USERPROFILE, './Desktop/Ferret.lnk'),
      fs.readFileSync('assets/Ferret.lnk')
    )
    // try to delete the original ferret.exe
    try {
      fs.unlinkSync(caller)
    } catch (e) {
      // if it fails, it means that the original ferret.exe is not the original ferret.exe
      log.error('Cannot delete the original ferret.exe.')
      process.exit(1)
    }
  }
}

export { hideConsole }
