import { spawn } from 'child_process'
import fs from 'fs'
import { getAllFiles, copyAssets } from './parcel_support.js'
import process from 'process'

function parcelWatch (path) {
  const staticSrc = path + '/static_src'
  const file = path.substring(path.lastIndexOf('/') + 1)

  if (fs.existsSync(staticSrc)) {
    const entryPoints = `${staticSrc}/entry_points.json`
    const outDir = `${path}/static`
    if (fs.existsSync(entryPoints)) {
      copyAssets('images', staticSrc, outDir, '')
      const entryPointsData = JSON.parse(fs.readFileSync(entryPoints, 'utf8'))
      entryPointsData.entry_points.forEach(element => {
        const splitName = element.split('.')[0]
        const cmd = `NODE_ENV=development parcel watch ${splitName}`
        const args = [`${staticSrc}/${element}`, `--out-dir ${outDir}`, `--out-file ${file}-${splitName}.js`, '--public-url /static/']
        runWatchCommand(cmd, args)
      })
    } else {
      const cmd = 'NODE_ENV=development parcel watch'
      const args = [staticSrc + '/index.js', `--out-dir ${outDir}`, `--out-file ${file}.js`, '--public-url /static/']
      runWatchCommand(cmd, args)
    }
  }
}

function runWatchCommand (cmd, args) {
  console.log(cmd, args)
  const results = spawn(cmd, args, { shell: true })
  results.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  results.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })
  results.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

export default function runWatch () {
  console.log('Build Assets for Development')
  const currentDir = process.cwd()
  const searchDir = process.cwd()
  getAllFiles(currentDir, searchDir, parcelWatch)
}
