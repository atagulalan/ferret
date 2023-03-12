function vibrate(options = { duration: 100, interval: 100, count: 1 }) {
  if (arguments.length !== 1) {
    throw new Error('Expected exactly one argument.')
  }

  if (Object.prototype.toString.call(options) !== '[object Object]') {
    throw new TypeError('Expected first argument to be an object.')
  }

  if (
    typeof options.duration !== 'number' ||
    !Number.isInteger(options.duration)
  ) {
    throw new TypeError('Expected options.duration to be an integer.')
  }

  if (
    typeof options.interval !== 'number' ||
    !Number.isInteger(options.interval)
  ) {
    throw new TypeError('Expected options.interval to be an integer.')
  }

  if (typeof options.count !== 'number' || !Number.isInteger(options.count)) {
    throw new TypeError('Expected options.count to be an integer.')
  }

  if (options.duration < 0) {
    throw new RangeError(
      'Expected options.duration to be greater or equal to zero.'
    )
  }

  if (options.interval < 0) {
    throw new RangeError(
      'Expected options.interval to be greater or equal to zero.'
    )
  }

  if (options.count < 0) {
    throw new RangeError(
      'Expected options.count to be greater or equal to zero.'
    )
  }

  if (!window) {
    return
  }

  if (!window.navigator) {
    return
  }

  if (!window.navigator.vibrate) {
    return
  }

  const pattern = []

  for (let index = 0; index < options.count; index++) {
    pattern.push(options.duration)
    pattern.push(options.interval)
  }

  window.navigator.vibrate(pattern)
}

function log(...args) {
  socket.emit('log', ...args)
}

function send(command, noVibrate) {
  if (!command) return
  if (!noVibrate && !!vibrate)
    vibrate({
      duration: 20,
      interval: 100,
      count: 1
    })
  socket.emit(0, command)
}
