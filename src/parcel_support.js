import fs from 'fs'
import ncp from 'ncp'
import path from 'path'
const fsExtra = require('fs-extra')

const ignoreDirectories = ['env', 'venv', '.env', '.venv', 'node_modules', '.mypy_cache', '.pytest_cache', '.github', '.circleci', '.cache', 'dist', 'out', 'static']

export default function getAllFiles (currentDir, dirPath, parcelFunction, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
  files.forEach(function (file) {
    const staticDir = `${dirPath.substring(0, dirPath.lastIndexOf('/'))}/static`
    const currentFile = `${dirPath}/${file}`
    const destination = staticDir + '/' + file
    if (!fs.existsSync(`${destination}/__init__.py`)) {
      if (!ignoreDirectories.includes(file)) {
        if (fs.statSync(currentFile).isDirectory()) {
          const operationPath = dirPath + '/' + file
          parcelFunction(operationPath)
          arrayOfFiles = getAllFiles(currentDir, operationPath, parcelFunction, arrayOfFiles)
        }
      } else {
        arrayOfFiles.push(path.join(dirPath, '/', file))
      }
    }
  }
  )
  return arrayOfFiles
}

function copyAssets (directory, staticSrc, destination, packageVersion) {
  const targetDirSrc = `${staticSrc}/${directory}`
  const targetDirOut = `${destination}/${directory}`
  console.log('copy assets was called')
  if (!fs.existsSync(targetDirOut)) {
    fs.mkdirSync(targetDirOut, { recursive: true })
  } else {
    fs.rmdirSync(targetDirOut, { recursive: true })
    fs.mkdirSync(targetDirOut, { recursive: true })
  }
  console.log('package_versio', packageVersion)
  if (packageVersion === '') {
    simpleCopy(targetDirSrc, targetDirOut)
  } else {
    versionedCopy(targetDirSrc, targetDirOut, packageVersion)
  }
}

function simpleCopy (targetDirSrc, targetDirOut) {
  console.log('simple copy was called')
  ncp(targetDirSrc, targetDirOut, function (err) {
    if (err) {
      console.error(err)
    }
  })
}

function versionedCopy (targetDirSrc, targetDirOut, version) {
  console.log('versioned copy was called')
  const files = fs.readdirSync(targetDirSrc)
  files.forEach((file) => {
    const fileSplit = file.split('.')
    const versionFile = `${fileSplit[0]}.${version}.${fileSplit[1]}`
    console.log(versionFile)
    console.log(`${targetDirSrc}/${file}`)
    console.log(`${targetDirOut}/${versionFile}`)
    fsExtra.copy(`${targetDirSrc}/${file}`, `${targetDirOut}/${versionFile}`, function (err) {
      if (err) {
        console.log('COPYING ERROR')
        console.error(err)
      }
    })
  })
}

export { copyAssets, getAllFiles }
