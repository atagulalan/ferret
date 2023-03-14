const { TYPE, ACTION } = CONFIG.STATUS

const validTypes = ['pulsating', 'static', 'icon']
const validStates = ['error', 'active', 'pending']

const createStatusIcon = ({ socket, element: statusIcon }) => {
  const showStatusIndicator = (status) => {
    if (!validTypes.includes(TYPE))
      return console.error(`Invalid status icon type: ${TYPE}`)
    if (!validStates.includes(status))
      return console.error(`Invalid status icon state: ${status}`)

    // clear status icon
    statusIcon.innerHTML = ''

    if (TYPE === 'icon') {
      const icon = document.createElement('i')
      icon.classList.add('bx')
      if (status === 'error') {
        icon.classList.add('bx-unlink')
      } else if (status === 'active') {
        icon.classList.add('bx-link')
      }
      statusIcon.appendChild(icon)
    } else if (TYPE === 'pulsating' || TYPE === 'static') {
      const div = document.createElement('div')
      div.classList.add('indicator', status, TYPE)
      statusIcon.appendChild(div)
    }
  }

  // init event listeners
  socket.on('disconnect', () => showStatusIndicator('error'))
  socket.on('connect', () => showStatusIndicator('active'))

  // if already connected
  if (socket.connected) showStatusIndicator('active')

  statusIcon.addEventListener('click', () => {
    if (ACTION === 'reload') window.location.reload()
    else if (ACTION === 'reconnect') socket.connect()
  })
}

// default export
export default createStatusIcon
