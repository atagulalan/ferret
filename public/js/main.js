const socket = io({
  autoConnect: false,
  reconnection: true
})

// set global handlers
window.socket = socket
// wait for page to load
window.addEventListener('load', () => socket.connect())

import createButton from './blocks/button.js'
import createTouchpad from './blocks/touchpad.js'
import createKeyboard from './blocks/keyboard.js'
import createStatusIcon from './blocks/status.js'
import createTaskbar from './blocks/taskbar.js'
import createSearch from './blocks/search.js'
import createUpload from './blocks/upload.js'

const { DEFAULT_BLOCK } = CONFIG

const BLOCKS = {
  button: createButton,
  touchpad: createTouchpad,
  keyboard: createKeyboard,
  status: createStatusIcon,
  taskbar: createTaskbar,
  search: createSearch,
  upload: createUpload
}

function createGrid(container, { designVertical, designHorizontal }) {
  const grid = document.createElement('div')
  grid.className = 'grid'
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

function creteBlockElement(block, { isVertical, isHorizontal } = {}) {
  // create button
  const element = document.createElement(block.tag)
  // set button id
  if (block.id) element.id = block.id
  // set button class
  if (block.class) element.className = block.class
  element.classList.add('block')
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

  // add block name as data
  element.dataset.name = block.name

  element.style.setProperty('--name', block.name)
  return element
}

function addBlock({ options, wrapper, orientation, type } = {}) {
  // fill in missing properties
  options = { ...DEFAULT_BLOCK, ...options }

  if (options.shortcut && type === 'shortcut') {
    options.type = options.shortcut
  }
  const currentBlock = BLOCKS[options.type]?.()

  // module missing alert
  if (!currentBlock?.onCreate) {
    console.warn(
      `${options.name || 'Block'} has no onCreate hook. Continuing...`
    )
    return
  }

  // create element
  const element = creteBlockElement(options, orientation)

  // add element to wrapper
  wrapper.appendChild(element)

  // call onCreate hook
  currentBlock.onCreate?.({ socket, element, block: options, type })

  // sanitize key
  currentBlock.element = element
  if (currentBlock.on) {
    // add block to on object
    Object.assign(currentBlock.on, currentBlock)
    // remove on key from on object
    delete currentBlock.on.on
  }

  if (options.shortcut) {
    element.addEventListener('click', () => {
      setActiveNavigation({ name: options.name })
      // update card title widths
      pageHistory.push({
        name: options.name,
        title: options.title
      })
    })
  }

  blockManager.add({
    name: options.name,
    destroy: () =>
      currentBlock.onDestroy?.({ socket, element, block: options }),
    notify: (key, ...args) => currentBlock.on?.[key]?.(...args)
  })
}

function initGrid(container, settings) {
  if (!container) return

  const { blocks, align, name, design, designVertical, designHorizontal } =
    settings

  if (!designVertical && !designHorizontal && !design) {
    console.error('Invalid design on page', name)
    return
  }

  // clean up container
  container.innerHTML = ''

  if (align === 'bottom') {
    // add spacer to card body
    const spacer = document.createElement('div')
    // add spacer class
    spacer.className = 'spacer'
    // add spacer to card body
    container.appendChild(spacer)
  }

  // create grid
  const grid = createGrid(container, {
    designVertical: designVertical || design,
    designHorizontal: designHorizontal || design
  })

  const uniqueBlocks = {
    verticalBlocks: new Set(
      (designVertical || design)
        .join(' ')
        .split(' ')
        .filter((x) => x && x !== '.')
    ),
    horizontalBlocks: new Set(
      (designHorizontal || design)
        .join(' ')
        .split(' ')
        .filter((x) => x && x !== '.')
    )
  }

  // for each button in the control panel
  blocks.forEach((options) =>
    addBlock({
      wrapper: grid,
      options,
      orientation: {
        isVertical: uniqueBlocks.verticalBlocks.has(options.name),
        isHorizontal: uniqueBlocks.horizontalBlocks.has(options.name)
      },
      type: 'block'
    })
  )
}

function setActiveCard({ card }) {
  cardTitles.scroll({ card })
  document
    .querySelector(
      `#root .page.active .card-titles .card-title:nth-child(${
        (card || 0) + 1
      })`
    )
    ?.click()
}

function setActiveNavigation({ name, index }) {
  // set active navigation button
  const navigationButtons = document.querySelectorAll('#navigation button')
  navigationButtons.forEach((button, buttonIndex) => {
    if (button.dataset.name === name || buttonIndex === index) {
      button.classList.add('active')
    } else {
      button.classList.remove('active')
    }
  })
}

function setActivePage({ name, index, card }) {
  // set active navigation button
  setActiveNavigation({ name, index })

  // set active page
  const pages = document.querySelectorAll('#root > div')
  pages.forEach((page, pageIndex) => {
    if (page.dataset.name === name || pageIndex === index) {
      page.classList.add('active')
    } else {
      page.classList.remove('active')
    }
  })

  // update card title widths
  cardTitles.update('#root .page.active .card-titles .card-title')

  setActiveCard({ card })
}

function initPages({ pages }) {
  const root = document.querySelector('#root')
  const navigation = document.querySelector('#navigation')
  if (!root) return
  if (!navigation) return

  // clear navigation
  navigation.innerHTML = ''

  // create navigation buttons
  pages.forEach((page) => {
    if (page.shortcut) return
    const navButton = document.createElement('button')
    navButton.dataset.name = page.name
    const navIcon = document.createElement('i')
    navIcon.classList.add(page.icon)
    const navText = document.createTextNode(page.text)
    navButton.appendChild(navIcon)
    navButton.appendChild(navText)
    // add element to navigation
    navigation.appendChild(navButton)

    // add click event listener
    navButton.addEventListener('click', () => {
      const lastOfType = pageHistory
        .list()
        .findLast((el) => el.name === page.name && el.type === page.type)

      pageHistory.go({
        type: page.type,
        name: page.name,
        card: lastOfType?.card || 0
      })
    })
  })

  // clear root
  root.innerHTML = ''

  // create pages
  pages.forEach((page) => {
    // default type is cards
    page.type = page.type || 'cards'

    // card page
    if (page.shortcut) {
      addBlock({
        wrapper: navigation,
        options: { ...page, type: page.shortcut },
        type: 'shortcut'
      })
    } else {
      // create page wrapper
      const pageWrapper = document.createElement('div')
      pageWrapper.classList.add('page')
      pageWrapper.dataset.name = page.name
      // add page wrapper to body
      root.appendChild(pageWrapper)

      // create card titles wrapper for scrollable mobile experience
      const cardTitlesWrapper = document.createElement('div')
      cardTitlesWrapper.classList.add('card-titles-wrapper')
      // add card titles wrapper to body
      pageWrapper.appendChild(cardTitlesWrapper)

      // create card titles container
      const cardTitlesElement = document.createElement('div')
      cardTitlesElement.classList.add('card-titles')
      // add card titles container to body
      cardTitlesWrapper.appendChild(cardTitlesElement)

      // create card container
      const cardContainer = document.createElement('div')
      cardContainer.classList.add('cards')
      // add card container to body
      pageWrapper.appendChild(cardContainer)

      cardContainer.addEventListener('scroll', scrollHandler)

      // create cards
      page.cards.forEach((card, cardIndex) => {
        // create page title
        const cardTitle = document.createElement('h2')
        cardTitle.classList.add('card-title')
        cardTitle.innerText = card.title
        // add page title to card titles container
        cardTitlesElement.appendChild(cardTitle)

        cardTitle.addEventListener('click', () => {
          cardContainer.scrollTo({
            left: (cardContainer.scrollWidth / page.cards.length) * cardIndex,
            behavior: 'smooth'
          })
        })

        // create card body
        const cardBody = document.createElement('section')
        cardBody.classList.add('card-body')

        // on grid scroll
        cardBody.addEventListener('scroll', (event) => {
          // get scroll position
          const { scrollTop } = event.target
          // add scroll position to grid style variables
          cardBody.style.setProperty('--grid-scroll-top', `${scrollTop}px`)
          eventBus.emit('pageScroll')
        })

        // add card body to card
        cardContainer.appendChild(cardBody)
        // create grid
        initGrid(cardBody, card)
      })
    }
  })
}

function goInitialPage({ initialActivePage, initialActiveCard, pages }) {
  if (!['number', 'string'].includes(typeof initialActivePage))
    initialActivePage = 0

  if (typeof initialActivePage === 'string')
    initialActivePage = pages.findIndex(
      ({ name }) => name === initialActivePage
    )

  if (initialActivePage === -1) throw new Error('Initial active page not found')

  const activePage = pages[initialActivePage]

  if (typeof initialActiveCard === 'string')
    initialActiveCard = activePage.cards.findIndex(
      ({ name }) => name === initialActiveCard
    )

  if (initialActiveCard === -1) throw new Error('Initial active card not found')

  // initialActivePage and initialActiveCard is number from now on

  // set active page
  setActivePage({ index: initialActivePage, card: initialActiveCard })

  // add to page history
  pageHistory.push({
    type: activePage.type,
    name: activePage.name,
    card: initialActiveCard
  })
}

function initToolbar({ toolbar }) {
  const toolbarElement = document.querySelector('#toolbar')
  if (!toolbarElement) return

  // clear toolbar
  toolbarElement.innerHTML = ''

  // create toolbar button elements
  toolbar.forEach((options) => {
    addBlock({
      wrapper: toolbarElement,
      options,
      type: 'toolbar'
    })
  })
}

function setGlobalStyleVariables({ globalStyleVariables }) {
  if (!globalStyleVariables) return
  Object.entries(globalStyleVariables).forEach(([key, value]) => {
    // set document variables
    document.documentElement.style.setProperty(`--${key}`, value)
  })
}

socket.on('load', ({ settings, username }) => {
  console.log(username)

  initPageHistoryManager({ setActivePage, setActiveNavigation })
  initCardTitleManager()
  initBlockManager()
  initEventBus()
  initViewportEventManager()

  // set global style variables
  setGlobalStyleVariables(settings)

  // remove all blocks
  blockManager.removeAll()

  // init toolbar
  initToolbar(settings)

  // init pages
  initPages(settings)

  // wait for fonts to load
  // this is necessary for correct title width calculation
  document.fonts.ready.then(() => {
    goInitialPage(settings)
    initTextFragmentHelper()
  })
})
