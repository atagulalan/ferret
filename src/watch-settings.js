import fs from 'fs'

export function initWatchSettings() {
  // Look for settings.json changes
  fs.watchFile('./settings.json', (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      try {
        const newSettings = JSON.parse(
          fs.readFileSync('./settings.json', 'utf8')
        )
        io.emit('load', {
          settings: newSettings
        })
        console.log('settings updated')
      } catch (e) {
        console.log('error loading settings')
        console.error(e)
      }
    }
  })
}
