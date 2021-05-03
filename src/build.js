import { runParcel } from './parcel_support.js'
import process from 'process'

export default function runBuild (isTest) {
  isTest = isTest || false
  console.log('Build Assets for Production')
  const currentDir = process.cwd()
  const searchDir = process.cwd()
  const arrayOfFiles = []
  const commandsSet = new Set()
  console.log(runParcel)
  return runParcel(currentDir, searchDir, 'build', arrayOfFiles, commandsSet, isTest)
}
