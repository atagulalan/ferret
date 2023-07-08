import SysTray from 'systray'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import { log } from './log.js'
import { getDirname, readAsset } from './asset-manager.js'

function showSystemTray({ ips, port }) {
  const startupFolder = path.resolve(
    process.env.APPDATA,
    './Microsoft/Windows/Start Menu/Programs/Startup/'
  )
  const systray = new SysTray.default({
    menu: {
      icon: fs.readFileSync(
        path.resolve(getDirname(), './public/favicon.ico'),
        {
          encoding: 'base64'
        }
      ),
      title: 'Ferret',
      tooltip: 'Ferret',
      items: [
        ...ips.map((ip) => ({
          title: ip,
          tooltip: ip,
          checked: false,
          enabled: false
        })),
        {
          title: 'Show QR code',
          tooltip: 'Show QR code',
          checked: false,
          enabled: true
        },
        {
          title: 'Show output',
          tooltip: 'Show output',
          checked: false,
          enabled: true
        },
        {
          title: 'Run at startup',
          tooltip: 'Run at startup',
          checked: fs.existsSync(path.resolve(startupFolder, './Ferret.lnk')),
          enabled: true
        },
        {
          title: 'Open settings',
          tooltip: 'Open settings',
          checked: false,
          enabled: true
        },
        {
          title: 'Exit',
          tooltip: 'Exit',
          checked: false,
          enabled: true
        }
      ]
    },
    debug: false,
    copyDir: true
  })

  systray.onClick((action) => {
    const actions = {
      'Show QR code': () => {
        child_process.exec(`start http://localhost:${port}/qr.html`)
      },
      'Show output': () => {
        child_process.exec(`start http://localhost:${port}/output.html`)
      },
      'Open settings': () => {
        // if not settings file exists, create on
        if (!fs.existsSync(path.resolve('./settings.json'))) {
          fs.writeFileSync(
            path.resolve('./settings.json'),
            readAsset('settings.json')
          )
        }
        child_process.exec(`start ${path.resolve('./settings.json')}`)
      },
      'Run at startup': () => {
        if (action.item.checked) {
          // remove from startup folder
          if (fs.existsSync(path.resolve(startupFolder, './Ferret.lnk'))) {
            try {
              fs.unlinkSync(path.resolve(startupFolder, './Ferret.lnk'))
            } catch (error) {
              log.error('Could not remove ferret from startup folder.', error)
              return
            }
          }
        } else {
          try {
            // copy to startup folder
            if (!fs.existsSync(startupFolder)) {
              fs.mkdirSync(startupFolder, { recursive: true })
            }
            fs.writeFileSync(
              path.resolve(startupFolder, './Ferret.lnk'),
              readAsset('Ferret.lnk')
            )
          } catch (error) {
            log.error('Could not copy ferret to startup folder.', error)
            return
          }
        }
        systray.sendAction({
          type: 'update-item',
          item: {
            ...action.item,
            checked: !action.item.checked
          },
          seq_id: action.seq_id
        })
      },
      Exit: () => {
        systray.kill()
      }
    }
    actions[action.item.title]?.()
  })
}

export { showSystemTray }
