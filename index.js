import { setDebugLevel } from './src/log.js'
import { showIPs } from './src/ip.js'
import { getUsername } from './src/username.js'
import { prepareFiles } from './src/prepare-files.js'
import { initSocketListener } from './src/connection.js'
import { settings } from './src/watch-settings.js'

async function init() {
  prepareFiles()
  const { debug } = settings
  setDebugLevel(debug || 'info')
  const username = await getUsername()
  let { PORT } = initSocketListener({ username })
  showIPs(PORT)
}

init()
