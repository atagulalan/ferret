const { TYPE, ACTION } = CONFIG.STATUS

const validTypes = ['pulsating', 'static', 'icon']
const validStates = ['error', 'active', 'pending']

export default () => ({
  onCreate: function ({ socket, element: statusIcon }) {
    const showStatusIndicator = (status) => {
      if (!validTypes.includes(TYPE))
        return console.error(`Invalid status icon type: ${TYPE}`)
      if (!validStates.includes(status))
        return console.error(`Invalid status icon state: ${status}`)

      // clear status icon
      statusIcon.innerHTML = ''

      if (TYPE === 'icon') {
        const icon = document.createElement('i')
        if (status === 'error') {
          icon.classList.add('iconoir-wifi-off')
        } else if (status === 'active') {
          icon.classList.add('iconoir-link')
        }
        statusIcon.appendChild(icon)
      } else if (TYPE === 'pulsating' || TYPE === 'static') {
        const div = document.createElement('div')
        div.classList.add('indicator', status, TYPE)
        statusIcon.appendChild(div)
      }
    }

    this.connectEvent = function () {
      showStatusIndicator('active')
    }
    this.disconnectEvent = function () {
      showStatusIndicator('error')
    }
    // add socket listeners
    socket.on('connect', this.connectEvent)
    socket.on('disconnect', this.disconnectEvent)

    // if already connected
    if (socket.connected) showStatusIndicator('active')

    this.clickEvent = function () {
      if (ACTION === 'reload') window.location.reload()
      else if (ACTION === 'reconnect') socket.connect()
    }

    statusIcon.classList.add('button')
    statusIcon.addEventListener('click', this.clickEvent)
  },
  onDestroy: function ({ socket, element: statusIcon }) {
    // remove socket listeners
    socket.off('disconnect', this.disconnectEvent)
    socket.off('connect', this.connectEvent)
    // remove event listeners
    statusIcon.removeEventListener('click', this.clickEvent)
  }
})
