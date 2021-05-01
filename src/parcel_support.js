import fs from 'fs'
import path from 'path'
import pkgUp from 'pkg-up'
import { spawn } from 'child_process'

const fsExtra = require('fs-extra')

const defaultIgnoreDirectories = ['env', 'venv', '.env', '.venv', 'node_modules', '.mypy_cache', '.pytest_cache', '.github', '.circleci', '.cache', 'dist', 'out', 'static', 'jest.config.js']

function runParcel (currentDir, dirPath, call, arrayOfFiles, commands, isTest) {
  const files = fs.readdirSync(dirPath)
  files.forEach(function (file) {
    const staticDir = `${dirPath.substring(0, dirPath.lastIndexOf('/'))}/static`
    const currentFile = `${dirPath}/${file}`
    const destination = staticDir + '/' + file
    if (!fs.existsSync(`${destination}/__init__.py`)) {
      commands = compileFiles(currentDir, currentFile, call, arrayOfFiles, commands, isTest)
    }
  }
  )
  return { arrayOfFiles, commands }
}

function compileFiles (currentDir, currentFile, call, arrayOfFiles, commands, isTest) {
  if (verifyValidDirectory(currentFile)) {
    const parcelCommands = parcelCompile(currentFile, call, isTest)
    if (typeof parcelCommands === 'object') {
      commands = union(commands, parcelCommands)
    }
    const parcelReturn = runParcel(currentDir, currentFile, call, arrayOfFiles, commands, isTest)
    commands = union(commands, parcelReturn.commands)
  } else {
    arrayOfFiles.push(path.join(currentFile))
  }
  return commands
}

function union (setA, setB) {
  const _union = new Set(setA)
  for (const elem of setB) {
    _union.add(elem)
  }
  return _union
}

function parcelCompile (path, call, isTest) {
  const staticSrc = `${path}/static_src`
  const packageJson = JSON.parse(fs.readFileSync(pkgUp.sync({ cwd: staticSrc }), 'utf8'))
  const file = path.substring(path.lastIndexOf('/') + 1)
  let buildType
  if (call === 'watch') {
    buildType = 'development'
  } else {
    buildType = 'production'
  }

  if (fs.existsSync(staticSrc)) {
    const outDir = `${path}/static`
    const staticResource = packageJson.static_resources || []

    staticResource.forEach(element => {
      copyAssets(element, staticSrc, outDir, packageJson.version, packageJson.name)
    })
    const commands = new Set()
    const entryPoints = packageJson.entry_points || []
    entryPoints.forEach(element => {
      const splitName = element.split('.')[0]
      const cmd = `NODE_ENV=${buildType} parcel ${call}`
      const args = [`${staticSrc}/${element}`, `--out-dir ${outDir}`, `--out-file ${file}-${splitName}.${packageJson.version}.js`, '--public-url /static/']
      commands.add(runCommand(cmd, args, outDir, call, isTest))
    })
    return commands
  }
}

async function runCommand (cmd, args, outDir, production, isTest) {
  if (production === 'production') {
    fs.rmdirSync(outDir, { recursive: true })
  }
  const results = spawn(cmd, args, { shell: true })
  if (!isTest) {
    results.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })
    results.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    })
  }

  return results
}

function verifyValidDirectory (currentFile) {
  let valid = false
  const fileSplit = currentFile.split('/')
  const endOfPath = fileSplit[fileSplit.length - 1]
  if (!defaultIgnoreDirectories.includes(endOfPath)) {
    if (fs.statSync(currentFile).isDirectory()) {
      valid = true
    }
  }
  return valid
}

function copyAssets (directory, staticSrc, destination, packageVersion, packageName) {
  const targetDirSrc = `${staticSrc}/${directory}`
  const targetDirOut = `${destination}/${directory}`
  let success = true
  if (fs.existsSync(targetDirSrc)) {
    if (!fs.existsSync(targetDirOut)) {
      fs.mkdirSync(targetDirOut, { recursive: true })
    } else {
      fs.rmdirSync(targetDirOut, { recursive: true })
      fs.mkdirSync(targetDirOut, { recursive: true })
    }
    success = versionedCopy(targetDirSrc, targetDirOut, packageVersion, packageName)
  }
  return success
}

function versionedCopy (targetDirSrc, targetDirOut, version, name) {
  const files = fs.readdirSync(targetDirSrc)
  let success = true
  files.forEach((file) => {
    const versionFile = getFileName(name, file, version)
    const response = copyOperation(targetDirOut, targetDirSrc, file, versionFile)
    if (!response) {
      success = response
    }
  })
  return success
}

function getFileName (name, file, version) {
  const fileSplit = file.split('.')
  let fileName = fileSplit[0]
  if (!fileName.includes(name)) {
    fileName = `${name}-${fileName}`
  }
  let versionFile
  if (fileSplit[1]) {
    versionFile = `${fileName}.${version}.${fileSplit[1]}`
  } else {
    versionFile = `${fileName}.${version}`
  }

  return versionFile
}

function copyOperation (targetDirOut, targetDirSrc, file, versionFile) {
  const targetOrigin = `${targetDirSrc}/${file}`
  const targetPost = `${targetDirOut}/${versionFile}`
  let success = true
  fsExtra.copy(targetOrigin, targetPost, function (err) {
    if (err) {
      console.log('COPYING ERROR')
      console.error(err)
      success = false
    }
  })
  return success
}

module.exports = {
  getFileName,
  copyOperation,
  runParcel,
  versionedCopy,
  runCommand,
  copyAssets,
  verifyValidDirectory,
  compileFiles,
  parcelCompile
}
