export default () => ({
  data: {
    input: null,
    blurEvent: null,
    clickEvent: null,
    changeEvent: null,
    status: 'hidden'
  },
  on: {
    viewportSizeChange: function ({ offsetTop }) {
      // if keyboard is closed and we are on shortcut page, go back to last page
      if (offsetTop === '0px' && this.data.status === 'visible') {
        log('keyboard closed')

        this.data.blurEvent()
      }
    }
  },
  onCreate: function ({ element }) {
    const createHiddenInput = () => {
      // create input element
      const input = document.createElement('input')
      input.setAttribute('type', 'text')

      // add search-input class
      input.classList.add('search-input')

      // disable autocapitalize and autocorrect
      input.setAttribute('autocapitalize', 'off')
      input.setAttribute('autocorrect', 'off')

      // add input element to body
      document.body.appendChild(input)

      return input
    }

    this.data.clickEvent = () => {
      if (!('fragmentDirective' in document)) {
        alert('Your browser does not support fragment directives.')
        return
      }

      // create and focus input element
      const input = createHiddenInput()
      this.data.input = input

      this.data.focusEvent = () => {
        log('keyboard opened')
        document.body.style.setProperty('--app-pointer-events', 'none')
        this.data.status = 'visible'
      }
      input.addEventListener('focus', this.data.focusEvent)

      // focus input element
      input.focus()

      // on input element blur
      this.data.blurEvent = () => {
        document.body.style.setProperty('--app-pointer-events', 'auto')
        this.data.status = 'hidden'
        // notify other blocks via event bus
        eventBus.emit('keyboardBlur')
        // remove event listeners
        input.removeEventListener('change', this.data.changeEvent)
        input.removeEventListener('focus', this.data.focusEvent)
        input.removeEventListener('blur', this.data.blurEvent)
        this.data.input = null
        // remove input element
        document.body.removeChild(input)
      }
      input.addEventListener('blur', this.data.blurEvent)

      this.data.changeEvent = (event) => {
        const text = encodeURIComponent(event.target.value.trim())
        if (text) {
          window.location.assign(`#:~:text=${text}`)
          // to remove old search results
          // window.location.reload()
        }
        this.data.blurEvent()
      }
      input.addEventListener('change', this.data.changeEvent)
    }

    // add click event listener
    element.addEventListener('click', this.data.clickEvent)
  },
  onDestroy: function ({ element: keyboard }) {
    // remove click event listener
    keyboard.removeEventListener('click', this.data.clickEvent)
    this.data.input?.removeEventListener('change', this.data.changeEvent)
    this.data.input?.removeEventListener('focus', this.data.focusEvent)
    this.data.input?.removeEventListener('blur', this.data.blurEvent)
  }
})
