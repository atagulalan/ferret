import { setDebugLevel } from './src/log.js'
import { showIPs } from './src/ip.js'
import { showSystemTray } from './src/tray.js'
import { getUsername } from './src/username.js'
import { getScreenResolution } from './src/screen.js'
import { prepareFiles } from './src/prepare-files.js'
import { initSocketListener } from './src/connection.js'
import { settings } from './src/watch-settings.js'
import { installRoutine } from './src/install.js'

async function init() {
  const initialWorkingDirectory = process.cwd()
  prepareFiles(initialWorkingDirectory)
  const isInstalled = await installRoutine()
  if (isInstalled) {
    const { debug } = settings
    setDebugLevel(debug || 'info')
    const username = await getUsername()
    const { width, height } = await getScreenResolution()
    let { port } = initSocketListener({ username, width, height })
    let { ips } = showIPs(port)
    showSystemTray({ ips, port })
  }
}

init()
