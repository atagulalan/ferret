import * as child from 'child_process'
import * as path from 'path'
import * as readline from 'readline'

export class SysTray {
  _conf
  _process
  _rl
  _binPath

  constructor(menu) {
    const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')
    this._binPath = path.resolve(ferretFolder, './tray_windows_release.exe')
    this._process = child.spawn(this._binPath, [], { windowsHide: true })
    this._rl = readline.createInterface({ input: this._process.stdout })
    this.onReady(() => this.writeLine(JSON.stringify(menu)))
  }

  onReady(listener) {
    this._rl.on('line', (line) => {
      let action = JSON.parse(line)
      if (action.type === 'ready') listener()
    })
    return this
  }

  onClick(listener) {
    this._rl.on('line', (line) => {
      let action = JSON.parse(line)
      if (action.type === 'clicked') listener(action)
    })
    return this
  }

  writeLine(line) {
    if (line) this._process.stdin.write(line.trim() + '\n')
    return this
  }

  sendAction(action) {
    this.writeLine(JSON.stringify(action))
    return this
  }

  kill(exitNode = true) {
    if (exitNode) this.onExit(() => process.exit(0))
    this._rl.close()
    this._process.kill()
  }

  onExit(listener) {
    this._process.on('exit', listener)
  }

  onError(listener) {
    this._process.on('error', (err) => listener(err))
  }
}
