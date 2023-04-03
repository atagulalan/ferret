const maxWaitDuration = 200

let touching = false
let currentCard = 0
let card = 0

function scrollHandler(e) {
  eventBus.emit('pageScroll')
  card = e.target.scrollLeft / e.target.offsetWidth

  document.querySelector('.card-titles-wrapper')?.scrollTo({
    left: cardTitles.scroll({ card })
  })

  var atSnappingPoint = e.target.scrollLeft % e.target.offsetWidth === 0
  var timeOut = atSnappingPoint ? 0 : maxWaitDuration //see notes

  clearTimeout(e.target.scrollTimeout) //clear previous timeout

  const waitForScroll = () => {
    if (e.target.scrollLeft % e.target.offsetWidth === 0) {
      // update current card
      currentCard = e.target.scrollLeft / e.target.offsetWidth
      // timeoutSet = false
    } else {
      // in between
      if (touching) {
        e.target.scrollTimeout = setTimeout(waitForScroll, timeOut)
      } else {
        e.target.scrollTo({
          left:
            Math.round(e.target.scrollLeft / e.target.offsetWidth) *
            e.target.offsetWidth,
          behavior: 'smooth'
        })
      }
    }
  }

  e.target.scrollTimeout = setTimeout(waitForScroll, timeOut)
}

// wait page load
window.addEventListener('load', () => {
  document.addEventListener('touchstart', () => {
    touching = true
  })
  document.addEventListener('touchend', () => {
    touching = false
  })
})
