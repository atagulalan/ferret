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
  if (!window.socket) return
  // send log to server
  socket.emit('log', ...args)
}

let repeatCaptureScreen = false
function getCurrentScreen(options, { repeat }, callback) {
  if (!window.socket) return
  if (repeat) repeatCaptureScreen = true
  // send log to server
  socket.emit(4, options, (...args) => {
    if (repeatCaptureScreen) {
      callback(...args)
      // no need to send initial options now
      getCurrentScreen(null, { repeat }, callback)
    }
  })
}

function stopCurrentScreen() {
  if (!window.socket) return
  repeatCaptureScreen = false
  // send log to server
  socket.emit(5)
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

function sendTaskbarRequest() {
  if (!socket) return
  socket.emit(2)
}

function sendFiles(files, onProgress) {
  if (!socket) return
  const filesArr = Array.from(files)
  const filesLength = filesArr.length
  const singleFileUpload = (file) => {
    if (!file) return
    socket.emit(
      3,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      },
      file,
      () => {
        singleFileUpload(filesArr.shift())
        onProgress(100 - (filesArr.length / filesLength) * 100)
      }
    )
  }
  singleFileUpload(filesArr.shift())
}

function initTextFragmentHelper() {
  // if text fragment is present, update url
  const textFragment = performance
    .getEntriesByType('navigation')[0]
    .name.split('#:~:text=')[1]
  if (textFragment) {
    // remove hash
    window.location.hash = '#:~:text=' + textFragment
  }
}

function initPageHistoryManager({ setActivePage, setActiveNavigation }) {
  const pageHistoryArr = []

  const setPage = (page) => {
    if (page.type === 'cards') {
      setActivePage({ name: page.name, card: page.card })
    } else if (page.type === 'shortcut') {
      setActiveNavigation({ name: page.name })
    }
  }

  window.pageHistory = {
    push: function (page) {
      pageHistoryArr.push(page)
    },
    pop: function () {
      return pageHistoryArr.pop()
    },
    get: function () {
      return pageHistoryArr[pageHistoryArr.length - 1]
    },
    list: function () {
      return pageHistoryArr
    },
    go: function (page) {
      pageHistoryArr.push(page)
      setPage(page)
    },
    back: function () {
      pageHistoryArr.pop()
      const page = pageHistoryArr[pageHistoryArr.length - 1]
      setPage(page)
    }
  }
}

function initCardTitleManager() {
  const cardTitles = []
  window.cardTitles = {
    getLength: function () {
      return cardTitles.length
    },
    clear: function () {
      cardTitles.length = 0
    },
    add: function ({ width, element }) {
      cardTitles.push({
        width,
        element
      })
    },
    get: function (index) {
      return cardTitles[index]
    },
    list: function () {
      return cardTitles
    },
    update: function (query) {
      // clear card titles
      this.clear()
      // for each card title
      document.querySelectorAll(query).forEach((element) => {
        // get card title width
        const width = element.offsetWidth
        // add card title properties to cardTitles
        this.add({ width, element })
      })
    },
    addCardToHistory: function (card) {
      const currentPage = pageHistory.get()
      // if not already last page
      if (currentPage && currentPage.card !== card) {
        pageHistory.push({
          type: currentPage.type,
          name: currentPage.name,
          card: card
        })
      }
    },
    scroll: function ({ card }) {
      // set default card
      if (!card) card = 0
      if (card % 1 === 0) this.addCardToHistory(card)

      // for each card title
      cardTitles.forEach(({ element }, index) => {
        // if card is not active
        // get how far index is from card
        const distance = Math.abs(index - card)
        // if distance is greater than 1
        if (distance > 1) {
          // set css variable
          element.style.setProperty('--active', 0)
        }
        // if distance is less than 1
        else {
          element.style.setProperty('--active', 1 - distance)
        }
      })

      // calculate how much transformX should be
      let cumulativeCardTitleWidth = 0

      for (let i = 0; i < card; i++) {
        cumulativeCardTitleWidth +=
          card % 1 === 0 || i < ~~card
            ? this.get(i).width
            : (card % 1) * this.get(~~card).width
      }

      return cumulativeCardTitleWidth
    }
  }
}

let store = {}
function initStore(initialObject) {
  store = initialObject
  window.store = {
    get: function (key) {
      return store[key]
    },
    set: function (key, value) {
      store[key] = value
    },
    list: function () {
      return store
    }
  }
}

function initBlockManager() {
  const activeBlocks = []

  window.blockManager = {
    add: function ({ name, destroy, notify }) {
      activeBlocks.push({ name, destroy, notify })
      eventBus.on('*', notify)
    },
    remove: function (block) {
      const index = activeBlocks.indexOf(block)
      if (index > -1) {
        // notify block that it will be destroyed
        block.destroy()
        activeBlocks.splice(index, 1)
      }
    },
    removeAll: function () {
      // notify all blocks that all blocks will be destroyed
      activeBlocks.forEach(({ destroy }) => destroy?.())
      // clear active blocks
      activeBlocks.length = 0
    },
    list: function () {
      return activeBlocks
    }
  }
}

function initEventBus() {
  const listeners = []
  window.eventBus = {
    on: function (event = '*', callback) {
      if (!callback) return
      listeners.push({
        event,
        callback
      })
    },
    emit: function (...args) {
      listeners.forEach((listener) => {
        if (listener.event === '*' || listener.event === args[0]) {
          listener.callback(...args)
        }
      })
    }
  }
}

function getViewportEventHandler(callback) {
  let viewportEventPendingUpdate = false
  function viewportEventHandler(event) {
    if (viewportEventPendingUpdate) return
    viewportEventPendingUpdate = true

    requestAnimationFrame(() => {
      viewportEventPendingUpdate = false
      const layoutViewport = document.body

      // Since the bar is position: fixed we need to offset it by the
      // visual viewport's offset from the layout viewport origin.
      const viewport = event.target
      const offsetLeft = viewport.offsetLeft
      const offsetTop =
        viewport.height -
        layoutViewport.getBoundingClientRect().height +
        viewport.offsetTop

      // set property to body to use in css
      document.body.style.setProperty(
        '--keyboard-offset-left',
        offsetLeft + 'px'
      )
      document.body.style.setProperty('--keyboard-offset-top', offsetTop + 'px')
      document.body.style.setProperty('--keyboard-scale', 1 / viewport.scale)

      callback({
        offsetLeft: offsetLeft + 'px',
        offsetTop: offsetTop + 'px',
        scale: 1 / viewport.scale
      })
    })
  }
  return { viewportEventHandler }
}

function initViewportEventManager() {
  if (window.viewportEventHandler) {
    // unregister
    window.visualViewport.removeEventListener(
      'scroll',
      window.viewportEventHandler
    )
    window.visualViewport.removeEventListener(
      'resize',
      window.viewportEventHandler
    )
  }
  const { viewportEventHandler } = getViewportEventHandler(
    ({ offsetTop, offsetLeft, scale }) => {
      eventBus.emit('viewportSizeChange', { offsetTop, offsetLeft, scale })
    }
  )
  window.viewportEventHandler = viewportEventHandler
  window.visualViewport.addEventListener('scroll', viewportEventHandler)
  window.visualViewport.addEventListener('resize', viewportEventHandler)
}
