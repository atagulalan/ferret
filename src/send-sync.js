import util from 'util'
import { execFile } from 'child_process'
import conversions from '../conversions.js'
import { log } from './log.js'
// promisify execFile
const run = util.promisify(execFile)

let executeLock = false
const commandQueue = []

export function addToQueue(...commands) {
  commands.forEach((command, i) => {
    commandQueue.push({
      status: 'pending',
      id: +new Date() + '-' + i,
      command
    })
  })
}

export async function sendSync(...items) {
  if (items.every(({ command }) => !command)) return

  // if already looping through command queue, add to queue
  if (executeLock) return
  executeLock = true

  for (let { command, id } of items) {
    // convert main command
    const [mainCommand, ...args] = command.split(' ')
    const { command: convertedCommand, argConverter } =
      conversions[mainCommand] || {}
    log.silly('Executing sync command.')
    log.debug(command)
    try {
      // change status
      commandQueue.find(({ id: i }) => i === id).status = 'executing'
      const eCmd = convertedCommand || mainCommand
      const eArgs = argConverter ? argConverter(...args) : args
      await run('./win32/nircmd.exe', [eCmd, ...eArgs])
      log.silly('Sync command executed.')
      // remove from queue
      commandQueue.splice(
        commandQueue.findIndex(({ id: i }) => i === id),
        1
      )
    } catch (error) {
      // An error ocurred attempting to execute the script
      log.error('Sync command failed.', error)
    }
  }
  executeLock = false
}

// loop through command queue
setInterval(() => {
  if (!executeLock) {
    sendSync(...commandQueue.filter(({ status }) => status === 'pending'))
  }
}, 1)
