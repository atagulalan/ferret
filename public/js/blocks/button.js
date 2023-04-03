const { REPEAT_INITIAL_DELAY, ACTIVE_CLASS_DELAY } = CONFIG.BUTTON

// ios button stuck fix
document.addEventListener('touchstart', function () {}, false)

// right click context menu fix
document.addEventListener('contextmenu', (event) => event.preventDefault())

export default () => ({
  data: {
    ignoreNextTouchEnd: false
  },
  on: {
    pageScroll: function () {
      // remove active class
      this.element.classList.remove('active')
      this.data.ignoreNextTouchEnd = true
    }
  },
  onCreate: function ({ element: button, block }) {
    // add touch event listener
    this.touchStartEvent = () => {
      // do not ignore until scroll
      this.data.ignoreNextTouchEnd = false
      setTimeout(() => {
        if (this.data.ignoreNextTouchEnd) return
        // set active class
        button.classList.add('active')
      }, ACTIVE_CLASS_DELAY)
      // get command
      const command = block.command
      // get down command
      const commandDown = block.commandDown
      // command is prioritized over commandDown
      send(commandDown)

      // REPEATER
      // get repeat interval
      const repeatInterval = block.repeatInterval
      // if repeat interval is set
      if (repeatInterval) {
        // wait initial delay, but user can always cancel
        const timeout = setTimeout(() => {
          // add repeating class
          button.classList.add('repeating')
          // send command every interval
          const interval = setInterval(() => {
            if (this.data.ignoreNextTouchEnd) return
            send(command)
          }, repeatInterval)
          // on touch end, clear interval
          button.addEventListener('touchend', () => clearInterval(interval))
        }, REPEAT_INITIAL_DELAY)
        // on touch end, clear timeout
        button.addEventListener('touchend', () => {
          // remove repeating class
          button.classList.remove('repeating')
          // clear timeout
          clearTimeout(timeout)
        })
      }
    }

    this.touchEndEvent = () => {
      if (this.data.ignoreNextTouchEnd) {
        this.data.ignoreNextTouchEnd = false
        return
      }
      setTimeout(() => {
        // remove active class
        button.classList.remove('active')
      }, ACTIVE_CLASS_DELAY)
      // get command
      const command = block.command
      // get command
      const commandUp = block.commandUp
      // send command
      send(command || commandUp)
    }

    // add touch event listener
    button.addEventListener('touchstart', this.touchStartEvent)
    button.addEventListener('touchend', this.touchEndEvent)

    button.classList.add('button')

    // add button styling
    if (block.color) button.style.setProperty('--button-color', block.color)
    if (block.background)
      button.style.setProperty('--button-background', block.background)
  },
  onDestroy: function ({ element: button }) {
    // remove touch event listener
    button.removeEventListener('touchstart', this.touchStartEvent)
    button.removeEventListener('touchend', this.touchEndEvent)
  }
})
