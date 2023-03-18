import { setDebugLevel } from './src/log.js'
import { showIPs } from './src/ip.js'
import { initTaskbarInterval } from './src/taskbar.js'
import { getUsername } from './src/username.js'
import { prepareFiles } from './src/prepare-files.js'
import { initSocketListener } from './src/connection.js'

const { settings } = prepareFiles()
const { debug, ignoredProcessNames } = settings
setDebugLevel(debug || 'info')
const username = await getUsername()

let { PORT } = initSocketListener({ settings, username })
initTaskbarInterval({ ignoredProcessNames })
showIPs(PORT)
