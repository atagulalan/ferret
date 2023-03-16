import util from 'util'
import { execFile } from 'child_process'
import conversions from '../conversions.js'
import { log } from './log.js'
// promisify execFile
const run = util.promisify(execFile)

export function send(...commands) {
  if (commands.every((command) => !command)) return

  for (let command of commands) {
    log.silly('Executing send command.')
    log.debug(command)
    // convert main command
    const [mainCommand, ...args] = command.split(' ')
    const { command: convertedCommand, argConverter } =
      conversions[mainCommand] || {}

    try {
      const eCmd = convertedCommand || mainCommand
      const eArgs = argConverter ? argConverter(...args) : args
      run('./win32/nircmd.exe', [eCmd, ...eArgs])
    } catch (error) {
      // An error ocurred attempting to execute the script
      log.error('Send command failed.', error)
    }
  }
}
