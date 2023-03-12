const CONFIG = {
  // DEFAULT_BLOCK is used to fill in missing properties
  DEFAULT_BLOCK: {
    tag: 'button',
    type: 'button'
  },
  // TOUCHPAD is used to configure touchpad behavior
  TOUCHPAD: {
    MOVE_THRESHOLD: 0.9, // if the touchpad is moved more than this value, it will be considered a drag
    MAX_TAP_DISTANCE: 10, // distance between touch start and touch end to be considered a tap click
    MAX_TAP_TIME: 200, // time between touch start and touch end to be considered a tap click
    MAX_SECOND_TAP_DISTANCE: 40, // distance between first and second tap click
    MAX_SECOND_TAP_TIME: 200, // time between touch start and touch end to be considered a tap click
    DOUBLE_TAP_BETWEEN_TAPS_DURATION: 100, // time between first and second tap click
    CLICK_DELAY: 100, // clicks after delay. be careful, it must be greater than DOUBLE_TAP_BETWEEN_TAPS_DURATION.
    DOUBLE_TAP_HOLD_DURATION: 200 // minimum drag time to be considered a double tap click and hold. if you drag for less than this time, it will be considered a double click, not click and hold
  },
  // BUTTON is used to configure button behavior
  BUTTON: {
    REPEAT_INITIAL_DELAY: 400 // button hold delay before repeat starts
  }
}
