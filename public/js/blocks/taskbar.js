const { TYPE } = CONFIG.TASKBAR

export default {
  data: {
    taskbarEvent: null,
    changeEvent: null,
    focusEvent: null,
    blurEvent: null
  },
  onCreate: function ({ socket, element: taskbar }) {
    let isTaskbarActive = false

    // disable until items are loaded
    taskbar.disabled = true

    const updateItems = (items) => {
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

    // TODO use type from config
    console.log('type', TYPE)

    // listen for items change
    this.taskbarEvent = function ({ foreground, items }) {
      // if taskbar is active, do not update
      if (isTaskbarActive) return
      updateItems(items)
      // if foreground is in items, set taskbar value
      if (items.find((item) => item.value === foreground)) {
        taskbar.value = foreground
      }
    }
    socket.on('taskbar', this.taskbarEvent)

    this.changeEvent = function () {
      const { value } = taskbar
      isTaskbarActive = false
      taskbar.blur()
      socket.emit(0, `win activate handle ${value}`, `win max handle ${value}`)
    }

    // on taskbar focus
    this.focusEvent = function () {
      isTaskbarActive = true
    }

    // on taskbar blur
    this.blurEvent = function () {
      isTaskbarActive = false
    }

    // add event listeners
    taskbar.addEventListener('change', this.changeEvent)
    taskbar.addEventListener('focus', this.focusEvent)
    taskbar.addEventListener('blur', this.blurEvent)
  },
  onDestroy: function ({ socket }) {
    // remove socket listeners
    socket.off('taskbar', this.taskbarEvent)
    // remove event listeners
    taskbar.removeEventListener('change', this.changeEvent)
    taskbar.removeEventListener('focus', this.focusEvent)
    taskbar.removeEventListener('blur', this.blurEvent)
  }
}
