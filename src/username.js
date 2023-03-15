import { PowerShell } from 'node-powershell'

export async function getUsername() {
  try {
    const usernameShell = PowerShell.$`[System.Environment]::UserName`
    const username = (await usernameShell).raw
    return username
  } catch (err) {
    console.log(err)
    return ''
  }
}
