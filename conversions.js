export default {
  mouse: {
    command: 'sendmouse'
  },
  volume: {
    command: 'changesysvolume',
    argConverter: (...args) => {
      return args.map((arg, i) => {
        if (i === 0) {
          return arg * 655
        }
        return arg
      })
    }
  },
  key: {
    command: 'sendkey'
  },
  press: {
    command: 'sendkeypress'
  }
}
