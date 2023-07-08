import { exec } from 'pkg'
import fs from 'fs'

console.log('Building with pkg')
exec(['.']).then(() => {
  // remove bundle.cjs
  fs.unlinkSync('bundle.cjs')
  console.log('Build completed.')
})
