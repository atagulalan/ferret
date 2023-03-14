const socket = io({
  autoConnect: false,
  reconnection: true
})

// set global handler
window.socket = socket

import createButton from './blocks/button.js'
import createTouchpad from './blocks/touchpad.js'
import createKeyboard from './blocks/keyboard.js'
import createStatusIcon from './blocks/status.js'

const { DEFAULT_BLOCK } = CONFIG

const BLOCKS = {
  button: createButton,
  touchpad: createTouchpad,
  keyboard: createKeyboard,
  status: createStatusIcon
}

function createGrid(container, design) {
  const grid = document.createElement('div')
  grid.id = 'grid'
  grid.style.setProperty(
    'grid-template-areas',
    design.map((row) => `"${row}"`).join(' ')
  )
  container.appendChild(grid)
  return grid
}

function creteElement(block) {
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

  element.style.setProperty('--name', block.name)
  return element
}

socket.on('load', ({ blocks, design }) => {
  const container = document.querySelector('#container')
  // clean up container
  container.innerHTML = ''
  // create grid
  const grid = createGrid(container, design)

  // for each button in the control panel
  blocks.forEach((block) => {
    // fill in missing properties
    block = { ...DEFAULT_BLOCK, ...block }
    // create element
    const element = creteElement(block)
    // add element to control panel
    grid.appendChild(element)
    // add functionality
    BLOCKS[block.type]?.({ socket, element, block })
    // TODO: add module missing alert
  })
})

socket.connect()
