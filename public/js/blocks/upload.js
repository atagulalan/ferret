export default () => ({
  data: {
    input: null,
    clickEvent: null,
    changeEvent: null,
    blurEvent: null
  },
  onCreate: function ({ element: upload }) {
    // create span element for progress
    const progress = document.createElement('span')
    progress.classList.add('progress')
    upload.appendChild(progress)

    const createHiddenInput = () => {
      // create input element
      const input = document.createElement('input')
      input.setAttribute('type', 'file')

      // set multiple attribute
      input.setAttribute('multiple', '')

      // hide input element
      input.style.position = 'absolute'
      input.style.left = '-9999px'

      // add input element to body
      document.body.appendChild(input)
      return input
    }

    this.data.changeEvent = (event) => {
      // get files
      const files = event.target.files

      // if no files, return
      if (!files.length) {
        return
      }
      progress.classList.remove('done')
      progress.style.setProperty('--upload-percentage', 0 + '%')
      sendFiles(files, (newPercentage) => {
        // set progress bar
        progress.style.setProperty('--upload-percentage', newPercentage + '%')
        if (newPercentage === 100) {
          progress.classList.add('done')
        }
      })
    }

    this.data.clickEvent = () => {
      // create and focus file input element
      const input = createHiddenInput()
      this.data.input = input

      // on input element change
      input.addEventListener('change', this.data.changeEvent)

      // show file input window
      input.click()
    }

    // add click event listener
    upload.addEventListener('click', this.data.clickEvent)
  },
  onDestroy: function ({ element: upload }) {
    // remove click event listener
    upload.removeEventListener('click', this.data.clickEvent)
    this.data.input?.removeEventListener('change', this.data.changeEvent)
  }
})
