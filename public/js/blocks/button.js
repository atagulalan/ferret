const { REPEAT_INITIAL_DELAY } = CONFIG.BUTTON

// ios button stuck fix
document.addEventListener('touchstart', function () {}, false)

// right click context menu fix
document.addEventListener('contextmenu', (event) => event.preventDefault())

const createButton = ({ socket, element: button, block }) => {
  // add touch event listener
  button.addEventListener('touchstart', function () {
    // get command
    const command = block.command
    // get down command
    const commandDown = block.commandDown
    // command is prioritized over commandDown
    send(command || commandDown)

    // REPEATER
    // get repeat interval
    const repeatInterval = block.repeatInterval
    // if repeat interval is set
    if (repeatInterval) {
      // wait initial delay, but user can always cancel
      const timeout = setTimeout(() => {
        // send command every interval
        const interval = setInterval(() => send(command), repeatInterval)
        // on touch end, clear interval
        button.addEventListener('touchend', () => clearInterval(interval))
      }, REPEAT_INITIAL_DELAY)
      // on touch end, clear timeout
      button.addEventListener('touchend', () => clearTimeout(timeout))
    }
  })

  button.addEventListener('touchend', () => {
    // get command
    const commandUp = block.commandUp
    // send command
    send(commandUp)
  })
}

export default createButton
