let CURRENT_LEVEL = 3
const DEBUG_LEVELS = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  SILLY: 5
}

function setDebugLevel(DEBUG) {
  CURRENT_LEVEL =
    typeof DEBUG === 'string' ? DEBUG_LEVELS[DEBUG.toUpperCase()] : DEBUG || 3
}

function log(...args) {
  if (CURRENT_LEVEL >= DEBUG_LEVELS[DEBUG.toUpperCase()]) {
    console.log(`[INFO]`, ...args)
  }
}

log.error = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.ERROR) {
    console.error(`[ERROR]`, ...args)
  }
}
log.warn = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.WARN) {
    console.warn(`[WARN]`, ...args)
  }
}
log.info = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.INFO) {
    console.log(`[INFO]`, ...args)
  }
}
log.debug = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.DEBUG) {
    console.log(`[DEBUG]`, ...args)
  }
}
log.silly = (...args) => {
  if (CURRENT_LEVEL >= DEBUG_LEVELS.SILLY) {
    console.log(`[SILLY]`, ...args)
  }
}

export { log, setDebugLevel }
