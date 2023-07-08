import _7z from '7zip-min'
import fs from 'fs'
import { exec } from 'child_process'
import rcedit from 'rcedit'
import path from 'path'

console.log('Compressing with 7zip')

const SFX_PATH = 'build_tools\\compress\\7zSD.sfx'

function createConfig() {
  const installerConfig = `;!@Install@!UTF-8!
Title="Ferret"
BeginPrompt="Do you want to install Ferret?"
RunProgram="dist\\ferret.exe"
GUIMode="1"
;!@InstallEnd@!`

  // create installer config
  fs.writeFileSync('./dist/config.txt', installerConfig)
}

async function createInstaller() {
  // create installer
  return new Promise((res) =>
    exec(
      'copy /b "' +
        SFX_PATH +
        '" + "dist\\config.txt" + "dist\\Package.7z" "dist\\ferret-installer.exe"',
      (error, stdout, stderr) => {
        console.log(`${stdout}`)
        res()
      }
    )
  )
}

function removeLeftovers() {
  // remove leftovers
  fs.unlinkSync('./dist/config.txt')
  fs.unlinkSync('./dist/Package.7z')
}

function makeup() {
  rcedit(path.resolve(SFX_PATH), {
    'product-version': '1,0.0.0',
    'file-version': '1,0.0.0',
    icon: path.resolve('./public/favicon.ico'),
    'version-string': {
      FileDescription: 'Ferret Installer',
      ProductName: 'Ferret Installer',
      LegalCopyright: `© ${new Date().getFullYear()} atagulalan`,
      OriginalFilename: 'ferret-installer.exe',
      CompanyName: 'atagulalan'
    }
  })
}

// create package
_7z.cmd(['a', '-mx9', 'dist\\Package.7z', 'dist\\ferret.exe'], async (err) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('Package created.')

  makeup()
  createConfig()
  await createInstaller()
  removeLeftovers()
})

console.log('Build completed.')
