const { TYPE } = CONFIG.TASKBAR

const createTaskbar = ({ socket, element: taskbar }) => {
  let isTaskbarActive = false

  // disable until items are loaded
  taskbar.disabled = true

  const updateItems = (items) => {
    // if taskbar is active, do not update
    if (isTaskbarActive) return

    if (items.length === 0) {
      // disable
      taskbar.disabled = true
    }

    // get current selected item
    const { value } = taskbar

    // clear all items
    taskbar.innerHTML = ''

    // create items
    items.forEach((item) => {
      const element = document.createElement('option')
      element.innerText = item.name
      element.value = item.value
      taskbar.appendChild(element)
    })

    // enable
    taskbar.disabled = false

    // set selected item
    taskbar.value = value
  }

  console.log('type', TYPE)

  // listen for items change
  socket.on('taskbar', ({ foreground, items }) => {
    taskbar.value = foreground
    console.log('foreground', foreground)
    updateItems(items)
  })

  taskbar.addEventListener('change', () => {
    const { value } = taskbar
    isTaskbarActive = false
    taskbar.blur()
    socket.emit(0, `win activate handle ${value}`, `win max handle ${value}`)
  })

  // on taskbar focus
  taskbar.addEventListener('focus', () => {
    isTaskbarActive = true
  })

  // on taskbar blur
  taskbar.addEventListener('blur', () => {
    isTaskbarActive = false
  })
}

// default export
export default createTaskbar
