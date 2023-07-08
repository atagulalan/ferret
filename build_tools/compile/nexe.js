import { compile } from 'nexe'
import fs from 'fs'

console.log('Building with nexe')
// not working
compile({
  input: 'bundle.cjs',
  output: 'dist/ferret.exe',
  icon: 'public/favicon.ico',
  resources: [
    './{assets,public}/**/*',
    // i know this is weird, but it works. we don't need whole package,
    // we just need package.json files. this is a workaround.
    './node_modules/{engine.io-parser,socket.io-parser}/package.json',
    // we need this for systray
    './node_modules/systray/traybin/tray_windows_release.exe'
  ],
  build: true,
  verbose: true
}).then(() => {
  // remove bundle.cjs
  fs.unlinkSync('bundle.cjs')
})
