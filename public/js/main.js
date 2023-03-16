const socket = io({
  autoConnect: false,
  reconnection: true
})

const activeBlocks = []

// set global handlers
window.socket = socket
window.bus = function (...args) {
  blocks.notify(...args)
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
  console.log('Welcome,', username)

  const { blocks, designVertical, designHorizontal, background } = settings
  // set background
  document.body.style.background = `${background}`

  const container = document.querySelector('#container')

  // notify all blocks that all blocks will be destroyed
  activeBlocks.forEach((block) => block.destroy())

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

    // module missing alert
    if (!BLOCKS[block.type].onCreate) {
      console.error(`${block.name || 'Block'} has no onCreate hook`)
    }

    // call onCreate hook
    BLOCKS[block.type].onCreate?.({ socket, element, block })

    activeBlocks.push({
      name: block.name,
      destroy: () => BLOCKS[block.type].onDestroy?.({ socket, element, block }),
      notify: () => BLOCKS[block.type].on?.({ socket, element, block })
    })
  })
})

socket.connect()
