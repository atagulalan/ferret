import path from 'path'
import { spawn } from 'child_process'
import { PowerShell } from 'node-powershell'
import PNGCrop from 'png-crop'

const ferretFolder = path.resolve(process.env.APPDATA, './ferret/')

let isStopped = false
let ffmpeg = null
let lastScreenshot = null
let lastCrop = null
let cursorPosition = { x: 0, y: 0, diff_x: 0, diff_y: 0 }
let globalOptions = {}

// helper function, converts stream to byte array
const streamToByteArray = (stream, callback) => {
  if (isStopped) return
  let buffer = []
  stream.on('data', (chunk) => {
    buffer.push(chunk)
    let isSame = Buffer.compare(
      chunk.slice(-10),
      Buffer.from([0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])
    )
    if (!isSame && buffer.length) {
      if (isStopped) return
      callback(Buffer.concat(buffer))
      buffer = []
    }
  })
}

// subroutine, updates cursor position and calls updateCrop
const updateCursorPosition = () => {
  if (isStopped) return
  if (!ffmpeg) return
  const subprocess = spawn(path.resolve(ferretFolder, './mpos.exe'), ['-gp'])
  subprocess.stdout.on('data', (data) => {
    if (isStopped) return
    try {
      let newCursorPosition = JSON.parse(data.toString())
      cursorPosition = {
        x: newCursorPosition.x,
        y: newCursorPosition.y,
        diff_x: newCursorPosition.diff_x,
        diff_y: newCursorPosition.diff_y
      }
      updateCrop()
    } catch (error) {
      console.error(error)
      stopRecording()
    }
  })
}

// subroutine, updates last crop and calls updateCursorPosition
function updateCrop() {
  if (isStopped) return
  if (!ffmpeg) return
  if (!lastScreenshot) return updateCursorPosition()
  const { width, height, screen_width, screen_height } = globalOptions
  try {
    PNGCrop.cropToStream(
      lastScreenshot,
      {
        width,
        height,
        top: Math.min(
          Math.max(0, cursorPosition.y - height / 2),
          Math.max(0, screen_height - height)
        ),
        left: Math.min(
          Math.max(0, cursorPosition.x - width / 2),
          Math.max(0, screen_width - width)
        )
      },
      function (err, outputStream) {
        if (isStopped) return
        if (err) {
          console.error(err)
          stopRecording()
        }
        streamToByteArray(outputStream, (croppedChunk) => {
          lastCrop = croppedChunk
          updateCursorPosition()
        })
      }
    )
  } catch (error) {
    console.error(error)
    stopRecording()
  }
}

// returns last screenshot
function getCurrentScreen() {
  if (isStopped) return
  if (!lastScreenshot || !lastCrop) return null
  return lastCrop
}

// sets global options
function updateOptions(options) {
  if (isStopped) return
  globalOptions = options
}

async function getScreenResolution() {
  const shell = PowerShell.$`(Get-WmiObject -Class Win32_VideoController).VideoModeDescription`
  const raw = (await shell).raw
  // get first 2 numbers
  const numbers = raw
    .split(' ')
    .map((x) => parseInt(x.trim()))
    .filter((x) => !isNaN(x))
    .slice(0, 2)
  return {
    width: numbers[0],
    height: numbers[1]
  }
}

// subroutine, starts recording to a file and always updates last screenshot
async function startRecording(options, callback) {
  if (ffmpeg) return callback(cursorPosition, getCurrentScreen())

  // first time initialization
  isStopped = false
  if (options) {
    const { width, height, screen_width, screen_height, fps } = {
      width: parseInt(options.width) || 100,
      height: parseInt(options.height) || 100,
      screen_width: parseInt(options.screen_width) || foundScreenWidth,
      screen_height: parseInt(options.screen_height) || foundScreenHeight,
      fps: parseInt(options.fps) || 5
    }
    updateOptions({ width, height, screen_width, screen_height, fps })
  }
  const ff_args = `-f gdigrab -draw_mouse 0 -video_size ${globalOptions.screen_width}x${globalOptions.screen_height} -framerate ${globalOptions.fps} -i desktop -c:v h264_nvenc -qp 0 -vcodec png -f image2pipe -`
  ffmpeg = spawn(path.resolve(ferretFolder, './ffmpeg.exe'), ff_args.split(' '))
  updateCursorPosition()
  streamToByteArray(ffmpeg.stdout, (chunk) => (lastScreenshot = chunk))
  return callback(null)
}

function stopRecording() {
  if (isStopped) return
  isStopped = true
  ffmpeg?.kill()
  ffmpeg = null
  lastScreenshot = null
  lastCrop = null
  cursorPosition = { x: 0, y: 0 }
  globalOptions = {}
}

export { startRecording, stopRecording, getScreenResolution }
