import os from 'os'
import QR from 'qrcode-terminal'
import Table from 'cli-table'

const interfaces = os.networkInterfaces()
const table = new Table()

function showIPs(port) {
  Object.keys(interfaces).forEach(function (interfaceName) {
    interfaces[interfaceName].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return
      }
      table.push({ [interfaceName]: iface.address + ':' + port })
      QR.generate(
        'http://' + iface.address + ':' + port,
        {
          small: true
        },
        function (qrCode) {
          table.push({
            '': qrCode
          })
        }
      )
    })
  })
  console.log(table.toString())
}

export { showIPs }
