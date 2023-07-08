import { setDebugLevel } from './src/log.js'
import { showIPs } from './src/ip.js'
import { showSystemTray } from './src/tray.js'
import { getUsername } from './src/username.js'
import { prepareFiles } from './src/prepare-files.js'
import { initSocketListener } from './src/connection.js'
import { settings } from './src/watch-settings.js'
import { installRoutine } from './src/install.js'

async function init() {
  const initialWorkingDirectory = process.cwd()
  prepareFiles(initialWorkingDirectory)
  installRoutine()
  const { debug } = settings
  setDebugLevel(debug || 'info')
  const username = await getUsername()
  let { port } = initSocketListener({ username })
  let { ips } = showIPs(port)
  showSystemTray({ ips, port })
}

init()
