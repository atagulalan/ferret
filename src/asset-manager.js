import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

function getDirname() {
  try {
    return __dirname
  } catch (e) {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  }
}

function readAsset(name) {
  return fs.readFileSync(path.resolve(getDirname(), 'assets/', name))
}

export { readAsset, getDirname }
