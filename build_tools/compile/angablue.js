import exe from '@angablue/exe'
import fs from 'fs'

console.log('Building with angablue (pkg + editing app icon)')
exe({
  entry: '.',
  out: './dist/ferret.exe',
  version: '2.0.0',
  target: 'latest-win-x64',
  icon: './public/favicon.ico',
  properties: {
    FileDescription: 'Ferret',
    ProductName: 'Ferret',
    LegalCopyright: 'atagulalan https://xava.me/',
    OriginalFilename: 'ferret.exe'
  }
}).then(() => {
  // remove bundle.cjs
  fs.unlinkSync('bundle.cjs')
  console.log('Build completed.')
})
