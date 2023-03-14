function vibrate(options = { duration: 100, interval: 100, count: 1 }) {
  if (arguments.length !== 1) throw new Error('Expected exactly one argument.')
  if (Object.prototype.toString.call(options) !== '[object Object]')
    throw new TypeError('Expected first argument to be an object.')

  Object.keys(options).forEach((key) => {
    if (
      typeof options[key] !== 'number' ||
      !Number.isInteger(options[key]) ||
      options[key] < 0
    )
      throw new TypeError(
        'Expected options to be an integer and to be greater or equal to zero.'
      )
  })

  if (!window) return
  if (!window.navigator) return
  if (!window.navigator.vibrate) return
  const pattern = []
  for (let index = 0; index < options.count; index++) {
    pattern.push(options.duration)
    pattern.push(options.interval)
  }
  window.navigator.vibrate(pattern)
}

function log(...args) {
  // send log to server
  socket.emit('log', ...args)
}

function send(...commands) {
  if (commands.every((command) => !command)) return
  if (!!vibrate)
    vibrate({
      duration: 20,
      interval: 100,
      count: 1
    })
  socket.emit(0, ...commands.filter((command) => !!command))
}

function sendSync(...commands) {
  if (commands.every((command) => !command)) return
  if (!!vibrate)
    vibrate({
      duration: 20,
      interval: 100,
      count: 1
    })
  socket.emit(1, ...commands.filter((command) => !!command))
}
