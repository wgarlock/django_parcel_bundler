/* global test expect done */
import runBuild from '../src/build'
import runWatch from '../src/watch'
import 'regenerator-runtime/runtime'

test('runBuild', () => {
  const parcelReturn = runBuild(true) // eslint-disable-line no-unused-vars
  Array.from(parcelReturn.commands).forEach(commands => {
    commands.then(response => {
      expect(typeof response.pid).toBe('number')
      process.kill(response.pid)
      done()
    })
  })
})

test('runWatch', () => {
  const parcelReturn = runWatch(true) // eslint-disable-line no-unused-vars
  Array.from(parcelReturn.commands).forEach(commands => {
    commands.then(response => {
      expect(typeof response.pid).toBe('number')
      process.kill(response.pid)
      done()
    })
  })
})
