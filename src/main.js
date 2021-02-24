import runBuild from './build';
import runWatch from './watch';

export default function buildAssets(options) {
    if (options.production){
        runBuild()
    }else{
        runWatch()
    }
}