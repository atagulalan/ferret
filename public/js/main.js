const socket = io({
  autoConnect: false,
  reconnection: true
})

const activeBlocks = []

// set global handlers
window.socket = socket
window.bus = {
  emit: function (...args) {
    activeBlocks.forEach((block) => block.notify?.(...args))
  }
}

import createButton from './blocks/button.js'
import createTouchpad from './blocks/touchpad.js'
import createKeyboard from './blocks/keyboard.js'
import createStatusIcon from './blocks/status.js'
import createTaskbar from './blocks/taskbar.js'

const { DEFAULT_BLOCK } = CONFIG

const BLOCKS = {
  button: createButton,
  touchpad: createTouchpad,
  keyboard: createKeyboard,
  status: createStatusIcon,
  taskbar: createTaskbar
}

function createGrid(container, { designVertical, designHorizontal }) {
  const grid = document.createElement('div')
  grid.id = 'grid'
  grid.style.setProperty(
    '--design-vertical',
    designVertical.map((row) => `"${row}"`).join(' ')
  )
  grid.style.setProperty(
    '--design-horizontal',
    designHorizontal.map((row) => `"${row}"`).join(' ')
  )
  container.appendChild(grid)
  return grid
}

function creteElement(block, { isVertical, isHorizontal }) {
  // create button
  const element = document.createElement(block.tag)
  // set button id
  if (block.id) element.id = block.id
  // set button class
  if (block.class) element.className = block.class
  // set button icon
  if (block.icon) {
    const icon = document.createElement('i')
    icon.classList.add('bx', block.icon)
    element.appendChild(icon)
  }
  // set button text
  if (block.text) {
    const text = document.createElement('span')
    text.innerText = block.text
    element.appendChild(text)
  }

  // set vertical and horizontal visibility by adding data
  if (isVertical) element.dataset.vertical = ''
  if (isHorizontal) element.dataset.horizontal = ''

  element.style.setProperty('--name', block.name)
  return element
}

socket.on('load', ({ settings, username }) => {
  // create span for username
  const highlightSpan = document.createElement('span')
  highlightSpan.classList.add('highlight')
  highlightSpan.appendChild(document.createTextNode(username))

  const usernameSpan = document.createElement('span')
  usernameSpan.id = 'username'
  usernameSpan.appendChild(document.createTextNode('Welcome back, '))
  usernameSpan.appendChild(highlightSpan)
  usernameSpan.appendChild(document.createTextNode('!'))

  // clear spacer
  document.querySelector('#spacer').innerHTML = ''

  // add username to spacer
  document.querySelector('#spacer').appendChild(usernameSpan)

  const { blocks, designVertical, designHorizontal, background } = settings
  // set background
  document.body.style.background = `${background}`

  const container = document.querySelector('#container')

  // notify all blocks that all blocks will be destroyed
  activeBlocks.forEach((block) => block.destroy())

  // clear active blocks
  activeBlocks.length = 0

  // clean up container
  container.innerHTML = ''

  // create grid
  const grid = createGrid(container, { designVertical, designHorizontal })

  const uniqueBlocks = {
    verticalBlocks: new Set(
      designVertical
        .join(' ')
        .split(' ')
        .filter((x) => x && x !== '.')
    ),
    horizontalBlocks: new Set(
      designHorizontal
        .join(' ')
        .split(' ')
        .filter((x) => x && x !== '.')
    )
  }

  // for each button in the control panel
  blocks.forEach((block) => {
    // fill in missing properties
    block = { ...DEFAULT_BLOCK, ...block }
    // create element
    const element = creteElement(block, {
      isVertical: uniqueBlocks.verticalBlocks.has(block.name),
      isHorizontal: uniqueBlocks.horizontalBlocks.has(block.name)
    })
    // add element to control panel
    grid.appendChild(element)

    const currentBlock = BLOCKS[block.type]?.()

    // module missing alert
    if (!currentBlock?.onCreate) {
      console.error(`${block.name || 'Block'} has no onCreate hook`)
    }

    // call onCreate hook
    currentBlock.onCreate?.({ socket, element, block })

    // sanitize key
    currentBlock.element = element
    if (currentBlock.on) {
      currentBlock.on.element = element
    }

    activeBlocks.push({
      name: block.name,
      destroy: () => currentBlock.onDestroy?.({ socket, element, block }),
      notify: (key, ...args) => currentBlock.on?.[key]?.(...args)
    })
  })
})

socket.connect()
