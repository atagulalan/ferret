import { PowerShell } from 'node-powershell'

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

export async function getTaskbar(ignoredProcessNames) {
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
  } catch (err) {
    console.log(err)
    return { foreground: '', items: [] }
  }
}

export function initTaskbarInterval({ sockets, ignoredProcessNames }) {
  let finishedInterval = true
  let taskbarStatus = null
  // after taskbar status is retrieved, run again indefinitely
  setInterval(async () => {
    // if taskbar status is consumed, get new status
    if (!taskbarStatus && finishedInterval) {
      finishedInterval = false
      taskbarStatus = await getTaskbar(ignoredProcessNames)
      finishedInterval = true
      process.stdout.write(`done in ${taskbarStatus.time}ms!\r\n`)
    } else {
      // loading dots
      if (!finishedInterval) process.stdout.write('.')
    }
  }, 100)

  // emit taskbar status to all clients
  setInterval(() => {
    if (taskbarStatus === null) {
      console.log('taskbar status not ready')
      return
    }
    // consume taskbar status
    sockets.forEach((socket) => socket.emit('taskbar', taskbarStatus))
    taskbarStatus = null
  }, 1000)
}