import { bring } from './run.js'
import path from 'path'
import fs from 'fs'
import { log } from './log.js'
import { settings } from './watch-settings.js'
import { readAsset } from './asset-manager.js'
import { PowerShell } from 'node-powershell'

async function installRoutine() {
  // if standalone is enabled, it means do not try to hide the console
  if (settings.standalone) {
    // do nothing
    return true // is installed
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

    // get desktop folder from powershell
    const shell = PowerShell.$`(New-Object -ComObject Shell.Application).namespace(0x10).Self.Path`
    const raw = (await shell).raw
    console.log(raw)
    // copy link to desktop
    fs.writeFileSync(
      // desktop folder
      path.resolve(raw, 'Ferret.lnk'),
      readAsset('Ferret.lnk')
    )

    log.info('New version installed. Restarting...')

    // run hideexec.exe to hide the console
    bring('hideexec.exe', [
      'ferret.exe',
      '--standalone',
      '--remove-installer',
      process.execPath
    ]).then(() => {
      // exit the process
      process.exit()
    })

    return false // is not installed yet, restarting...
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

    // try to delete the original ferret.exe
    try {
      fs.unlinkSync(caller)
    } catch (e) {
      // if it fails, it means that the original ferret.exe is not the original ferret.exe
      log.error('Cannot delete the original ferret.exe.')
    }
  }

  return true
}

export { installRoutine }
