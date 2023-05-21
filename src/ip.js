import os from 'os'
import QR from 'qrcode-terminal'
import Table from 'cli-table'
import { writeQR, log } from './log.js'

const interfaces = os.networkInterfaces()
const table = new Table()

function convertIpToString(...numbers) {
  const keys = 'VXZCHRGKJNFYMPWT'
  if (numbers[0] === 192 && numbers[1] === 168) {
    numbers = numbers.slice(2)
  }
  if (numbers[numbers.length - 1] === 4540) {
    numbers = numbers.slice(0, numbers.length - 1)
  }
  return numbers
    .map((number) => {
      let result = ''
      while (number > 0) {
        result = keys[number % keys.length] + result
        number = Math.floor(number / keys.length)
      }

      if (result.length === 0) return 'EE'
      if (result.length === 1) return 'E' + result
      return result
    })
    .join('')
}

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

  const ips = table
    .map((row) =>
      Object.entries(row)
        .filter(([key, value]) => !!key && !!value)
        .map(([key, value]) => `${value} (${key})`)
    )
    .flat()

  ips.forEach((ip) => {
    log.info(ip)
  })
  writeQR(table)

  return { ips, table }
}

export { showIPs, convertIpToString }
