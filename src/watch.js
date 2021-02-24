import { spawn } from 'child_process'
import fs from 'fs'
import getAllFiles from './parcel_support.js'
import process from 'process'

function parcelWatch (path) {
    const staticSrc = path + '/static_src'
    const file = path.substring(path.lastIndexOf('/') + 1)
    
    if (fs.existsSync(staticSrc)) {
        const cmd = 'NODE_ENV=development parcel watch'
        const args = [staticSrc + '/index.js', '--out-dir ' + path + '/static', '--out-file tns_mp_app-' + file + '.js', '--public-url /static/']
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
}

export default function runWatch () {
    console.log("Build Assets for Development")
    const currentDir = process.cwd()
    const searchDir = process.cwd()
    getAllFiles(currentDir, searchDir, parcelWatch)
}

