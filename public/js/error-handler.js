function showErrorMessage(err) {
  const urls = new RegExp(window.location.href, 'g')
  err = err.replace(urls, '/')
  const errorWrapper = document.createElement('div')
  errorWrapper.classList.add('toastify-error-wrapper')
  const errorDiv = document.createElement('div')
  errorDiv.classList.add('toastify-error')
  errorWrapper.appendChild(errorDiv)
  errorDiv.innerText = err
  Toastify({
    node: errorWrapper,
    duration: 3600000,
    close: false,
    gravity: 'bottom',
    position: 'center'
  }).showToast()
}

window.onunhandledrejection = (event) => {
  const err =
    event.reason.stack ||
    event.reason.message ||
    event.reason ||
    'Unhandled promise rejection'
  showErrorMessage(err)
}

window.onerror = function (msg, url, line, col) {
  let extra = !col ? '' : ':' + col
  const err = 'Error: ' + msg + '\n\tin ' + url + '\n\tat line ' + line + extra
  showErrorMessage(err)
}
