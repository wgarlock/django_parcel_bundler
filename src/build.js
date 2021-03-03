import { spawn } from 'child_process'
import fs from 'fs'
import getAllFiles from './parcel_support.js'
import process from 'process'

const packageJson = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'))
console.log(packageJson)
function parcelBuild (path) {
  const staticSrc = path + '/app_static_src'
  const file = path.substring(path.lastIndexOf('/') + 1)

  if (fs.existsSync(staticSrc)) {
    const entryPoints = staticSrc + '/entry_points.json'
    const outDir = path + '/static'
    if (fs.existsSync(entryPoints)) {
      const entryPointsData = JSON.parse(fs.readFileSync(entryPoints, 'utf8'))
      entryPointsData.entry_points.forEach(element => {
        if (fs.existsSync(staticSrc + '/' + element)) {
          const splitName = element.split('.')[0]
          const cmd = 'NODE_ENV=production parcel build' + ' ' + splitName
          const args = [`${staticSrc}/${element}`, `--out-dir ${outDir}`, `--out-file ${file}-${splitName}.${packageJson.version}.js`, '--public-url /static/']

          parcelBuildCommand(cmd, args, outDir, staticSrc, file, packageJson)
        }
      })
    } else {
      const cmd = 'NODE_ENV=production parcel build'
      const args = [`${staticSrc}/index.js`, `--out-dir ${outDir}`, `--out-file ${file}.${packageJson.version}.js`, '--public-url /static/']
      parcelBuildCommand(cmd, args, outDir, staticSrc, file, packageJson)
    }
  }
}

function parcelBuildCommand (cmd, args, outDir) {
  fs.rmdirSync(outDir, { recursive: true })
  console.log(cmd)
  console.log(args)
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

export default function runBuild () {
  console.log('Build Assets for Production')
  const currentDir = process.cwd()
  const searchDir = process.cwd()
  getAllFiles(currentDir, searchDir, parcelBuild)
}
