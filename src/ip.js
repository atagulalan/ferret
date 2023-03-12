const os = require('os')
const interfaces = os.networkInterfaces()
const QR = require('qrcode-terminal')
const Table = require('cli-table')
const table = new Table()

exports.showIPs = function (port) {
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
