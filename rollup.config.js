export default {
  input: 'index.js',
  output: {
    file: 'bundle.cjs',
    format: 'cjs'
  },
  external: [
    'qrcode-terminal',
    'cli-table',
    'socket.io',
    'express',
    'util',
    'child_process',
    'node-powershell',
    'os',
    'fs',
    'path',
    'url',
    'systray'
  ]
}
