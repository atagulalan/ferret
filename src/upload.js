import fs from 'fs'

function uploadFile(metadata, file, callback) {
  const newName = (filename, i) => {
    const ext = filename.split('.').pop()
    const name = filename.replace(`.${ext}`, '')
    return `${name} (${i}).${ext}`
  }
  // create upload folder in current working directory if it doesn't exist
  fs.mkdirSync('./upload', { recursive: true })
  // check if file already exists, if so, rename it
  if (fs.existsSync(`./upload/${metadata.name}`)) {
    let i = 2
    while (fs.existsSync(`./upload/${newName(metadata.name, i)}`)) {
      i++
    }
    metadata.name = `${newName(metadata.name, i)}`
  }
  // write file to upload folder
  fs.writeFile(`./upload/${metadata.name}`, file, (err) => {
    callback({ message: err ? 'failure' : 'success' })
  })
}

export { uploadFile }
