const socket = io()

const { DEFAULT_BLOCK } = CONFIG

const BLOCKS = {
  button: createButton,
  touchpad: createTouchpad
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
  // set button text
  if (block.text) element.innerText = block.text
  // set button icon
  // text is override by icon if both are set
  if (block.icon) element.innerHTML = `<i class="bx ${block.icon}"></i>`
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
    BLOCKS[block.type]({ element, block })
  })
})

// JOIN FERRET
socket.emit('join', 'ferret')

// RECONNECT
socket.on('disconnect', () => {
  // try to reconnect
  socket.connect()
  socket.emit('join', 'ferret')
})
