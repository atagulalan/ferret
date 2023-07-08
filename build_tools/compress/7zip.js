import _7z from '7zip-min'
import fs from 'fs'
import { exec } from 'child_process'

console.log('Compressing with 7zip')

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
      'copy /b "build_tools\\compress\\7zSD.sfx" + "dist\\config.txt" + "dist\\Package.7z" "dist\\ferret-installer.exe"',
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

// create package
_7z.cmd(['a', '-mx1', 'dist\\Package.7z', 'dist\\ferret.exe'], async (err) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('Package created.')

  createConfig()
  await createInstaller()
  removeLeftovers()
})

console.log('Build completed.')
