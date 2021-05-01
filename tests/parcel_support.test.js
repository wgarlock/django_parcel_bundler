/* global test expect */
import 'regenerator-runtime/runtime'
import process from 'process'

const {
  getFileName,
  copyOperation,
  runParcel,
  versionedCopy,
  runCommand,
  copyAssets,
  verifyValidDirectory,
  parcelCompile
} = require('../src/parcel_support')

test('getFileName', () => {
  expect(getFileName('name', 'index.js', '0.1.1')).toBe('name-index.0.1.1.js')
})

test('getFileName-empty-string', () => {
  expect(getFileName('', 'index.js', '0.1.1')).toBe('index.0.1.1.js')
})

test('copyOperation', () => {
  const response = copyOperation(
    './tests/es_test_directory/package/static/images',
    './tests/es_test_directory/package/static_src/images',
    'square.png',
    'square.0.1.0.png'
  )
  expect(response).toBe(true)
}
)

test('versionedCopy', () => {
  const response = versionedCopy(
    './tests/es_test_directory/package/static_src/images',
    './tests/es_test_directory/package/static/images',
    '0.1.1',
    'square.png'

  )
  expect(response).toBe(true)
})

test('copyAssets', () => {
  const response = copyAssets(
    'images',
    './tests/es_test_directory/package/static_src/images',
    './tests/es_test_directory/package/static/images',
    '0.1.1',
    'test_python_package'
  )
  expect(response).toBe(true)
})

test('verifyValidDirectory_is_valid', () => {
  const response = verifyValidDirectory(
    './tests/es_test_directory/package'
  )
  expect(response).toBe(true)
})

test('verifyValidDirectory_is_not_valid_virtualenv', () => {
  const response = verifyValidDirectory(
    './tests/es_test_directory/.venv'
  )
  expect(response).toBe(false)
})

test('verifyValidDirectory_is_not_valid_file', () => {
  const response = verifyValidDirectory(
    './tests/es_test_directory/just_a_test_file.txt'
  )
  expect(response).toBe(false)
})

test('runCommand_watch', (done) => {
  const cmd = 'NODE_ENV=development parcel watch'
  const staticSrc = './tests/es_test_directory/package/static_src'
  const outDir = './tests/es_test_directory/package/static'
  const file = 'index.js'
  const version = '0.1.2'
  const args = [staticSrc + '/index.js', `--out-dir ${outDir}`, `--out-file ${file}.${version}.js`, '--public-url /static/']
  runCommand(cmd, args, outDir, false).then(res => {
    expect(res.stdout._hadError).toBe(false)
    process.kill(res.pid)
    done()
  }).catch(err => {
    console.log(err)
  })
})

test('runCommand_build', (done) => {
  const cmd = 'NODE_ENV=production parcel build'
  const staticSrc = './tests/es_test_directory/package/static_src'
  const outDir = './tests/es_test_directory/package/static'
  const file = 'index.js'
  const version = '0.1.3'
  const args = [staticSrc + '/index.js', `--out-dir ${outDir}`, `--out-file ${file}.${version}.js`, '--public-url /static/']
  runCommand(cmd, args, outDir, false, true).then(res => {
    expect(res.stdout._hadError).toBe(false)
    process.kill(res.pid)
    done()
  }).catch(err => {
    console.log(err)
  })
})

test('parcelCompile_watch', (done) => {
  const path = './tests/es_test_directory/package'
  const call = 'watch'
  const isTest = true
  const commands = parcelCompile(path, call, isTest)
  commands.forEach(ele => {
    ele.then(response => {
      response.stdout.on('data', (data) => {
        expect(typeof response.pid).toBe('number')
        process.kill(response.pid)
        done()
      })
    }).catch(err => {
      console.log(err)
    })
  })
})

test('parcelCompile_build', (done) => {
  const path = './tests/es_test_directory/package'
  const call = 'build'
  const isTest = true
  const commands = parcelCompile(path, call, isTest)
  commands.forEach(ele => {
    ele.then(response => {
      response.stdout.on('data', (data) => {
        expect(typeof response.pid).toBe('number')
        process.kill(response.pid)
        done()
      })
    }).catch(err => {
      console.log(err)
    })
  })
})

test('runParcel', (done) => {
  const currentDir = './tests'
  const searchDir = './tests'
  const commandsSet = new Set()
  const parcelReturn = runParcel(currentDir, searchDir, 'watch', [], commandsSet, true) // eslint-disable-line no-unused-vars
  Array.from(parcelReturn.commands).forEach(commands => {
    commands.then(response => {
      expect(typeof response.pid).toBe('number')
      process.kill(response.pid)
      done()
    })
  })
})
