import { PowerShell } from 'node-powershell'
import { log } from './log.js'

export async function getUsername() {
  try {
    const usernameShell = PowerShell.$`[System.Environment]::UserName`
    const username = (await usernameShell).raw
    return username
  } catch (error) {
    log.error('Getting username failed.', error)
    return ''
  }
}
