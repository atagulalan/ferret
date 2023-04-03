import { PowerShell } from 'node-powershell'
import { log } from './log.js'
import { sockets } from './connection.js'
import { settings } from './watch-settings.js'

async function getForegroundWindow() {
  const foregroundShell = PowerShell.$`$code = @'
[DllImport("user32.dll")]
public static extern IntPtr GetForegroundWindow();
'@
Add-Type $code -Name Utils -Namespace Win32
$hwnd = [Win32.Utils]::GetForegroundWindow()
echo $hwnd
`
  const fgWindowHandle = (await foregroundShell).raw
  return fgWindowHandle
}

async function getActiveWindows(ignoredProcessNames) {
  const shell = PowerShell.$`Get-Process | Where-Object {$_.MainWindowTitle -ne ""} |  Select-Object -Property ProcessName, MainWindowTitle, MainWindowHandle, Id | ConvertTo-Json`
  const json = (await shell).raw
  return JSON.parse(json)
    .filter(
      ({ ProcessName }) => !(ignoredProcessNames || []).includes(ProcessName)
    )
    .map(({ MainWindowTitle, MainWindowHandle, Id }) => ({
      name: MainWindowTitle,
      value: MainWindowHandle
    }))
}

async function getTaskbar(ignoredProcessNames) {
  try {
    const start = performance.now()
    const [foreground, items] = await Promise.all([
      getForegroundWindow(),
      getActiveWindows(ignoredProcessNames)
    ])
    const end = performance.now()

    return {
      foreground,
      items,
      time: end - start
    }
  } catch (error) {
    log.error('Getting taskbar failed.', error)
    return { foreground: '', items: [] }
  }
}

function sendTaskbar() {
  const ignoredProcessNames = settings.ignoredProcessNames
  sockets.forEach(async (socket) =>
    socket.emit('taskbar', await getTaskbar(ignoredProcessNames))
  )
}

export { sendTaskbar }
