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
  input.setAttribute('style', 'position: absolute; top: 0px; left: 0px;')

  // disable autocapitalize and autocorrect
  input.setAttribute('autocapitalize', 'off')
  input.setAttribute('autocorrect', 'off')

  // add input element to body
  document.body.appendChild(input)

  return input
}

const createKeyboard = ({ element: keyboard, block }) => {
  keyboard.addEventListener('click', () => {
    // send p, delete, p again and it crashes
    let lastKey = ''

    // create and focus input element
    const input = createHiddenInput()

    // focus input element
    input.focus()

    const setLastKey = (target) => {
      if (!target) target = input
      // set caret position to end
      target.selectionStart = target.selectionEnd = target.value.length
      if (target.value) {
        lastKey = target.value[target.value.length - 1]
      }
      // clear target value
      // target.value = ''
      // IF WE CLEAR INPUT VALUE, IT LAGS
    }

    const sendInput = () => {
      // log('sendinput called')
      // const value = input.value
      // // get caret position
      // const caretPosition = input.selectionStart
      // // get last character
      // const key = value[caretPosition - 1]
      // // if key is undefined
      // if (!key) return
      if (!lastKey) return
      log('>', lastKey)
      if (METHOD === 'clipboard') clipboardMethod(lastKey)
      else if (METHOD === 'virtualKeyCode') virtualKeyCodeMethod(lastKey)
    }

    // on input element keydown
    const keyDownEvent = input.addEventListener('keyup', (event) => {
      let key = event.key
      setLastKey()
      if (key === 'Unidentified') {
        log('+')
        input.value = ''
        return
      }
      if (METHOD === 'clipboard') clipboardMethod(key)
      else if (METHOD === 'virtualKeyCode') virtualKeyCodeMethod(key)
    })

    const inputEvent = input.addEventListener('input', (event) => {
      // log('input event triggered')
      log('T', event.target.value)
      setLastKey(event.target)
      sendInput()
    })

    // on input element blur
    input.addEventListener('blur', () => {
      // remove event listeners
      input.removeEventListener('keydown', keyDownEvent)
      input.removeEventListener('input', inputEvent)
      // remove input element
      document.body.removeChild(input)
    })
  })
}
