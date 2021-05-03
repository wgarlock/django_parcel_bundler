import runBuild from './build'
import runWatch from './watch'

export default function buildAssets (options) {
  if (options.production) {
    let returnParcel = runBuild(false)
  } else {
    runWatch(false)
  }
}
