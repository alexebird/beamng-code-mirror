// Logger service
const isDevMode = process.env.NODE_ENV === 'development'

const
  DEBUG = 0b0001,
  INFO  = 0b0010,
  WARN  = 0b0100,
  ERROR = 0b1000

const STACK_TRACE = Symbol('Stack trace')

const consoleLogProvider = {
  log(level, ...msgs) {
    const method = {
      [DEBUG]: 'log',
      [INFO]: 'info',
      [WARN]: 'warn',
      [ERROR]: 'error',
    }[level]
    method && console[method](...msgs)
  }
}

let
  level = (isDevMode && DEBUG) | INFO | WARN | ERROR,
  providersInUse = [ consoleLogProvider ]

const
  setProviders = (...providers) => providersInUse = providers,
  _stackTrace = () => "\n" + (new Error()).stack,
  _log = (lvl, ...msgs) => {
    if (!(level & lvl)) return
    msgs = msgs.map(msg => msg=== STACK_TRACE ? _stackTrace() : msg)
    providersInUse.forEach(p => p.log && p.log(lvl, ...msgs))
  },
  debug = (...msgs) => _log(DEBUG, ...msgs),
  info =  (...msgs) => _log(INFO, ...msgs),
  warn =  (...msgs) => _log(WARN, ...msgs),
  error = (...msgs) => _log(ERROR, ...msgs)

const logger = {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  setProviders,
  debug,
  info,
  warn,
  error,
  set level(val) { return level = val },
  get level() { return level },
  STACK_TRACE
}

window.BNG_Logger = logger

export default logger
export { consoleLogProvider }
