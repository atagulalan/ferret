const { METHOD } = CONFIG.KEYBOARD

const clipboardMethod = (key) => {
  const noClipboardKeys = {
    ' ': 'spc',
    Enter: 'enter',
    Backspace: 'backspace'
  }
  if (noClipboardKeys[key]) {
    sendSync(`key ${noClipboardKeys[key]} press`)
  } else {
    sendSync(
      `clipboard saveclp clipboard.clp`,
      `clipboard set ${key}`,
      `press ctrl+v`,
      `wait 1`,
      `clipboard loadclp clipboard.clp`
    )
  }
}

const virtualKeyCodeMethod = (key) => {
  const keyConverter = {
    // shift, ctrl, alt,
    // enter, esc, leftmenu, rightmenu,
    // spc(space),
    // down, up, left, right,
    // home, end, insert, delete, pageup, pagedown,
    // plus, comma, minus, period,
    // lwin, rwin(Windows key), apps,
    // tab, multiply, add, subtract, seperator,
    // divide, backspace, pause, capslock, numlock, scroll, printscreen.
    ' ': 'spc',
    '+': 'plus',
    ',': 'comma',
    '-': 'minus',
    '.': 'period',
    '/': 'divide',
    '*': 'multiply'
  }
  // todo need better way to handle shift
  if (key.toUpperCase() === key) {
    sendSync(
      'key shift down',
      `key ${keyConverter[key] || key} press`,
      'key shift up'
    )
  } else {
    sendSync(`key ${keyConverter[key] || key} press`)
  }
}

const createHiddenInput = () => {
  // create input element
  const input = document.createElement('input')
  input.setAttribute('type', 'text')

  // hide input element
  input.setAttribute(
    'style',
    'position: absolute; top: -9999px; left: -9999px;'
  )

  // disable autocapitalize and autocorrect
  input.setAttribute('autocapitalize', 'off')
  input.setAttribute('autocorrect', 'off')

  // add input element to body
  document.body.appendChild(input)

  return input
}

export default {
  data: {
    clickEvent: null,
    focusEvent: null,
    keyUpEvent: null,
    inputEvent: null,
    blurEvent: null,
    input: null
  },
  onCreate: function ({ element: keyboard }) {
    this.clickEvent = function () {
      let lastKey = ''

      // create and focus input element
      const input = createHiddenInput()
      this.input = input

      this.focusEvent = function () {
        // notify other blocks via event bus
        bus.emit('keyboardFocus')
      }
      input.addEventListener('focus', this.focusEvent)

      // focus input element
      input.focus()

      const setLastKey = (target) => {
        if (!target) target = input
        // set caret position to end
        target.selectionStart = target.selectionEnd = target.value.length
        if (target.value) {
          lastKey = target.value[target.value.length - 1]
        }
        // IF WE CLEAR INPUT VALUE HERE, IT LAGS
      }

      const sendInput = () => {
        if (!lastKey) return
        if (METHOD === 'clipboard') clipboardMethod(lastKey)
        else if (METHOD === 'virtualKeyCode') virtualKeyCodeMethod(lastKey)
      }

      // on input element keydown
      this.keyUpEvent = function (event) {
        let key = event.key
        setLastKey()
        if (key === 'Unidentified') {
          input.value = ''
          return
        }
        if (METHOD === 'clipboard') clipboardMethod(key)
        else if (METHOD === 'virtualKeyCode') virtualKeyCodeMethod(key)
      }
      input.addEventListener('keyup', this.keyUpEvent)

      this.inputEvent = function (event) {
        setLastKey(event.target)
        sendInput()
      }
      input.addEventListener('input', this.inputEvent)

      // on input element blur
      this.blurEvent = function () {
        // notify other blocks via event bus
        bus.emit('keyboardBlur')
        // remove event listeners
        input.removeEventListener('focus', this.focusEvent)
        input.removeEventListener('keyup', this.keyUpEvent)
        input.removeEventListener('input', this.inputEvent)
        input.removeEventListener('blur', this.blurEvent)
        this.input = null
        // remove input element
        document.body.removeChild(input)
      }
      input.addEventListener('blur', this.blurEvent)
    }

    // add click event listener
    keyboard.addEventListener('click', this.clickEvent)
  },
  onDestroy: function ({ element: keyboard }) {
    // remove click event listener
    keyboard.removeEventListener('click', this.clickEvent)
    this.input?.removeEventListener('focus', this.focusEvent)
    this.input?.removeEventListener('keyup', this.keyUpEvent)
    this.input?.removeEventListener('input', this.inputEvent)
    this.input?.removeEventListener('blur', this.blurEvent)
  }
}
