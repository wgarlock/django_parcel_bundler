import arg from 'arg';
import buildAssets from "./main"

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
      {
        '--production': Boolean,
        '-p': '--production',
      },
      {
        argv: rawArgs.slice(2),
      }
    );
    return {
      production: args['--production'] || false,
    };
   }


export function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    buildAssets(options);
}