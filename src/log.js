import fs from 'fs'
import path from 'path'
import { settings } from './watch-settings.js'

let CURRENT_LEVEL = 3
const DEBUG_LEVELS = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  SILLY: 5
}

function setDebugLevel(DEBUG) {
  CURRENT_LEVEL =
    typeof DEBUG === 'string' ? DEBUG_LEVELS[DEBUG.toUpperCase()] : DEBUG || 3
}

function writeLog(...args) {
  const colorTable = {
    '[INFO]': 'white',
    '[ERROR]': 'red',
    '[WARN]': 'yellow',
    '[DEBUG]': 'blue',
    '[SILLY]': 'gray'
  }

  fs.appendFileSync(
    path.resolve(process.env.APPDATA, './ferret/', './session/output.html'),
    `<p style="color:${colorTable[args[0]]}">${args.join(' ')}</p>`
  )
}

function writeQR(...args) {
  fs.appendFileSync(
    path.resolve(process.env.APPDATA, './ferret/session/qr.html'),
    `<p>${args.map((arg) => {
      return String(arg).replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ''
      )
    })}</p>`
  )
}

function log(...args) {
  if (CURRENT_LEVEL >= DEBUG_LEVELS[DEBUG.toUpperCase()]) {
    console.log(`[INFO]`, ...args)
    writeLog(`[INFO]`, ...args)
  }
}

log.error = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.ERROR) {
    console.error(`[ERROR]`, ...args)
    writeLog(`[ERROR]`, ...args)
  }
}
log.warn = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.WARN) {
    console.warn(`[WARN]`, ...args)
    writeLog(`[WARN]`, ...args)
  }
}
log.info = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.INFO) {
    console.log(`[INFO]`, ...args)
    writeLog(`[INFO]`, ...args)
  }
}
log.debug = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.DEBUG) {
    console.log(`[DEBUG]`, ...args)
    writeLog(`[DEBUG]`, ...args)
  }
}
log.silly = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.SILLY) {
    console.log(`[SILLY]`, ...args)
    writeLog(`[SILLY]`, ...args)
  }
}

export { writeQR, writeLog, log, setDebugLevel }
