const {
  MAX_TAP_DISTANCE,
  MAX_TAP_TIME,
  MAX_SECOND_TAP_DISTANCE,
  MAX_SECOND_TAP_TIME,
  DOUBLE_TAP_BETWEEN_TAPS_DURATION,
  CLICK_DELAY,
  DOUBLE_TAP_HOLD_DURATION,
  MOVE_THRESHOLD
} = CONFIG.TOUCHPAD

export default () => ({
  on: {
    pageChange: function (page) {
      if (!this.touchpadElement) return
      if (!this.activeSocket) return

      const touchpad = this.touchpadElement
      if (page.name === 'touchpad') {
        if (this.canvas) return
        // add canvas to touchpad element
        this.canvas = document.createElement('canvas')
        this.canvas.width = touchpad.offsetWidth
        this.canvas.height = touchpad.offsetHeight
        touchpad.appendChild(this.canvas)
        // get canvas context
        const ctx = this.canvas.getContext('2d')

        const updateCursorPosition = ({ x, y }) => {
          if (!this.canvas) return
          if (!ctx) return
          const { screen_width, screen_height } = {
            screen_width: window.store.get('width'),
            screen_height: window.store.get('height')
          }
          const { relative_x, relative_y } = {
            relative_x:
              x - screen_width + this.canvas.width / 2 > 0
                ? x - screen_width + this.canvas.width
                : Math.min(x, this.canvas.width / 2),
            relative_y:
              y - screen_height + this.canvas.height / 2 > 0
                ? y - screen_height + this.canvas.height
                : Math.min(y, this.canvas.height / 2)
          }
          // draw cursor (+) in middle of canvas
          ctx.beginPath()
          ctx.arc(relative_x, relative_y, 10, 0, 2 * Math.PI)
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(relative_x - 5, relative_y)
          ctx.lineTo(relative_x + 5, relative_y)
          ctx.moveTo(relative_x, relative_y - 5)
          ctx.lineTo(relative_x, relative_y + 5)
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        const printToCanvas = (cursorPosition, chunk) => {
          const blob = new Blob([chunk], { type: 'image/png' })
          // to base64
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => {
            if (!this.canvas) return
            const base64data = reader.result
            // draw image
            const img = new Image()
            img.onload = () => {
              if (!this.canvas) return
              // scale img to fit canvas
              const scale = Math.min(
                this.canvas.width / img.width,
                this.canvas.height / img.height
              )
              const x = this.canvas.width / 2 - (img.width / 2) * scale
              const y = this.canvas.height / 2 - (img.height / 2) * scale
              ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
              updateCursorPosition(cursorPosition)
            }
            img.src = base64data
          }
        }

        const onScreen = (cursorPosition, chunk) => {
          if (!this.canvas) return
          if (!ctx) return
          if (!cursorPosition) return
          // subroutine
          printToCanvas(cursorPosition, chunk)
        }

        getCurrentScreen(
          {
            width: this.canvas.width,
            height: this.canvas.height,
            fps: this.fps,
            screen_width: window.store.get('width'),
            screen_height: window.store.get('height')
          },
          { repeat: true },
          onScreen
        )
      } else {
        // remove canvas from touchpad element
        if (this.canvas) {
          this.canvas.remove()
          this.canvas = null
          stopCurrentScreen()
        }
      }
    }
  },
  onCreate: function ({ socket, element: touchpad }) {
    if (!touchpad) return

    // TODO: should be configurable
    this.fps = 6
    this.activeSocket = socket
    this.touchpadElement = touchpad

    const moveCursor = ({ x, y }) => {
      if (x || y) socket.emit(0, `movecursor ${x} ${y}`)
    }

    const scrollWheel = ({ x, y }) => {
      if (x || y) socket.emit(0, `mouse wheel ${y * 10}`)
    }

    const FIRST_TOUCH = { x: 0, y: 0, timestamp: 0, index: -1 }
    const SECOND_TOUCH = { x: 0, y: 0, index: -1, initiated: false }
    const CURRENT_TOUCH = { x: 0, y: 0 }
    const LOGS = {
      LAST_TAP_TIMESTAMP: 0,
      LAST_TAP_POSITION: { x: 0, y: 0 },
      DOUBLE_TAP_RECENTLY: false,
      DOUBLE_TAP_TIMESTAMP: 0,
      TAP_TIMEOUT: null
    }

    const reset = () => {
      FIRST_TOUCH.x = CURRENT_TOUCH.x = FIRST_TOUCH.y = CURRENT_TOUCH.y = 0
      FIRST_TOUCH.timestamp = 0
      FIRST_TOUCH.index = -1
    }

    const checkIfDoubleTap = () => {
      // get double click logs
      const {
        LAST_TAP_TIMESTAMP,
        DOUBLE_TAP_RECENTLY,
        LAST_TAP_POSITION,
        TAP_TIMEOUT
      } = LOGS

      // if tap click recently, double click and hold
      if (
        LAST_TAP_TIMESTAMP + DOUBLE_TAP_BETWEEN_TAPS_DURATION > +new Date() &&
        !DOUBLE_TAP_RECENTLY
      ) {
        // hypotenuse of the triangle
        const hypotenuse = Math.sqrt(
          Math.pow(FIRST_TOUCH.x - LAST_TAP_POSITION.x, 2) +
            Math.pow(FIRST_TOUCH.y - LAST_TAP_POSITION.y, 2)
        )
        // time elapsed
        const timeElapsed = +new Date() - LAST_TAP_TIMESTAMP

        // check border conditions
        if (
          hypotenuse < MAX_SECOND_TAP_DISTANCE &&
          timeElapsed < MAX_SECOND_TAP_TIME
        ) {
          send('mouse left down')
          LOGS.DOUBLE_TAP_RECENTLY = true
          LOGS.DOUBLE_TAP_TIMESTAMP = +new Date()
          clearTimeout(TAP_TIMEOUT)
        }
      }
    }

    this.touchStartEvent = function (e) {
      e.preventDefault()

      // if second (or nth) touch present, focus on it
      if (e.targetTouches.length >= 2) {
        const secondTouchIndex = e.targetTouches.length - 1
        const secondTouch = e.targetTouches[secondTouchIndex]
        SECOND_TOUCH.x = secondTouch.pageX
        SECOND_TOUCH.y = secondTouch.pageY
        SECOND_TOUCH.index = 1
        SECOND_TOUCH.initiated = true
        return
      }

      // if touch already started, ignore
      if (FIRST_TOUCH.index > -1) return

      // get touch index
      const touchIndex = e.targetTouches.length - 1

      // get touch position
      const touch = e.targetTouches[touchIndex]

      // set all positions
      FIRST_TOUCH.x = CURRENT_TOUCH.x = touch.pageX
      FIRST_TOUCH.y = CURRENT_TOUCH.y = touch.pageY

      // set timestamp
      FIRST_TOUCH.timestamp = +new Date()

      // set touch index
      FIRST_TOUCH.index = touchIndex

      checkIfDoubleTap()
    }

    this.touchMoveEvent = function (e) {
      e.preventDefault()

      // if no touch started, return
      if (FIRST_TOUCH.index === -1) return

      // if second (or nth) touch present, scroll
      if (SECOND_TOUCH.index !== -1 && e.targetTouches[SECOND_TOUCH.index]) {
        const secondTouch = e.targetTouches[SECOND_TOUCH.index]
        const diff = {
          x: secondTouch.pageX - SECOND_TOUCH.x,
          y: secondTouch.pageY - SECOND_TOUCH.y
        }
        SECOND_TOUCH.x = secondTouch.pageX
        SECOND_TOUCH.y = secondTouch.pageY
        // scroll
        scrollWheel(diff)
        return
      }

      // get touch position
      const touch = e.targetTouches[FIRST_TOUCH.index]

      // calculate diff
      const diff = {
        x: touch.pageX - CURRENT_TOUCH.x,
        y: touch.pageY - CURRENT_TOUCH.y
      }

      // check if diff is less than threshold
      if (
        Math.abs(diff.x) < MOVE_THRESHOLD &&
        Math.abs(diff.y) < MOVE_THRESHOLD
      ) {
        return
      }

      // negative and positive values should be rounded differently
      // maybe there is a better way to do this
      diff.x = diff.x < 0 ? Math.floor(diff.x) : Math.ceil(diff.x)
      diff.y = diff.y < 0 ? Math.floor(diff.y) : Math.ceil(diff.y)

      // calculate speed
      const speed = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2))

      // update old position
      CURRENT_TOUCH.x = touch.pageX
      CURRENT_TOUCH.y = touch.pageY

      // acceleration
      const acceleration = Math.sqrt(speed)

      // move acceleration
      diff.x = Math.floor(diff.x * acceleration)
      diff.y = Math.floor(diff.y * acceleration)

      // move cursor
      moveCursor(diff)
    }

    this.touchEndEvent = function (e) {
      e.preventDefault()

      if (e.targetTouches.length >= 2) {
        const lastTouchIndex = e.targetTouches.length - 1
        const lastTouch = e.targetTouches[lastTouchIndex]
        SECOND_TOUCH.x = lastTouch.pageX
        SECOND_TOUCH.y = lastTouch.pageY
        SECOND_TOUCH.index = lastTouchIndex
        SECOND_TOUCH.initiated = true
      }

      // if second touch initiated, reset when all fingers are off the screen
      if (e.targetTouches.length === 1 && SECOND_TOUCH.initiated) {
        return
      }

      // if no touch started, return
      if (FIRST_TOUCH.index === -1) return

      // stop moving
      FIRST_TOUCH.index = -1

      if (SECOND_TOUCH.initiated && e.targetTouches.length === 0) {
        SECOND_TOUCH.index = -1
        SECOND_TOUCH.x = SECOND_TOUCH.y = 0
        SECOND_TOUCH.initiated = false
      } else {
        const { DOUBLE_TAP_RECENTLY, DOUBLE_TAP_TIMESTAMP } = LOGS

        // if double click recently, release
        if (DOUBLE_TAP_RECENTLY) {
          send('mouse left up')
          if (DOUBLE_TAP_TIMESTAMP + DOUBLE_TAP_HOLD_DURATION > +new Date())
            send('mouse left click')
          LOGS.DOUBLE_TAP_RECENTLY = false
          return reset()
        }
      }

      // if some of the fingers are still on the screen,
      // stop here
      if (e.touches.length !== 0) return
      // if all fingers are off the screen

      // hypotenuse of the triangle
      const hypotenuse = Math.sqrt(
        Math.pow(FIRST_TOUCH.x - CURRENT_TOUCH.x, 2) +
          Math.pow(FIRST_TOUCH.y - CURRENT_TOUCH.y, 2)
      )
      // time elapsed
      const timeElapsed = +new Date() - FIRST_TOUCH.timestamp

      // check border conditions
      if (hypotenuse < MAX_TAP_DISTANCE && timeElapsed < MAX_TAP_TIME) {
        // wait for double tap, if it is not double tap, send click
        LOGS.TAP_TIMEOUT = setTimeout(() => {
          send('mouse left click')
        }, CLICK_DELAY)

        // for double tap
        LOGS.LAST_TAP_TIMESTAMP = +new Date()
        LOGS.LAST_TAP_POSITION = {
          x: FIRST_TOUCH.x,
          y: FIRST_TOUCH.y
        }
      }
    }

    // add event listeners
    touchpad.addEventListener('touchstart', this.touchStartEvent)
    touchpad.addEventListener('touchmove', this.touchMoveEvent)
    touchpad.addEventListener('touchend', this.touchEndEvent)
  },
  onDestroy: function ({ element: touchpad }) {
    // remove event listeners
    touchpad.removeEventListener('touchstart', this.touchStartEvent)
    touchpad.removeEventListener('touchmove', this.touchMoveEvent)
    touchpad.removeEventListener('touchend', this.touchEndEvent)
  }
})
