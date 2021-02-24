import { spawn } from 'child_process'
import fs from 'fs'
import getAllFiles from './parcel_support.js'
import process from 'process'

const packageJson = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'))

function parcelBuild (path) {
    const staticSrc = path + '/static_src'
    const file = path.substring(path.lastIndexOf('/') + 1)
    if (fs.existsSync(staticSrc)) {
        const cmd = 'NODE_ENV=production parcel build'
        const outDir = path + '/static'
        fs.rmdirSync(outDir, { recursive: true })
        const args = [staticSrc + '/index.js', '--out-dir ' + outDir, '--out-file ' + packageJson.name + '-' + file + '.' + '.js', '--public-url /static/']
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
}

const currentDir = process.cwd()
const searchDir = process.cwd()
getAllFiles(currentDir, searchDir, parcelBuild)
