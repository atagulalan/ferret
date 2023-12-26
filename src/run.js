import util from 'util'
import path from 'path'
import { execFile, spawn } from 'child_process'

// promisify execFile
const execPromise = util.promisify(execFile)

const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')

const binaryLookup = {
  nircmd: path.resolve(ferretFolder, './nircmd.exe')
}

function run(command, args) {
  if (command in binaryLookup) {
    command = binaryLookup[command]
  }
  return execPromise(command, args, {
    cwd: ferretFolder
  })
}

async function bring(command, args) {
  return spawn(command, args, {
    cwd: ferretFolder,
    detached: true,
    stdio: ['ignore', 'pipe', 'ignore']
  })
}

export { run, bring }
