import child_process from 'node:child_process';
import path from 'node:path';

/**
 * @typedef {object} Options
 * @property {string | "latest" | "stable" | "lts"} version     Runtime version
 * @property {"normal" | "sdk"}                     flavor      Build flavor
 * @property {"linux" | "osx" | "win"}              platform    Target platform
 * @property {"ia32" | "x64" | "arm64"}             arch        Target arch
 * @property {string}                               srcDir      Source directory
 * @property {string}                               cacheDir    Cache directory
 * @property {string[]}                             argv        CLI arguments
 */

/**
 * Run NW.js application.
 * @async
 * @function
 * @param  {Options}    options  Options
 * @returns {Promise<child_process.ChildProcess | null>} - A Node.js process object
 */
async function run({
  version,
  flavor,
  platform,
  arch,
  srcDir,
  cacheDir,
  argv,
}) {
  const nwDir = path.resolve(
    cacheDir,
    `nwjs${flavor === 'sdk' ? '-sdk' : ''}-v${version}-${platform}-${arch}`,
  );

  const EXE_NAME = {
    win: 'nw.exe',
    osx: 'nwjs.app/Contents/MacOS/nwjs',
    linux: 'nw',
  };

  const nwExe = path.resolve(nwDir, EXE_NAME[platform]);

  /**
   * @type {child_process.ChildProcess | null}
   */
  let nwProcess = child_process.spawn(
    nwExe,
    [...[srcDir], ...argv],
    { stdio: 'inherit' },
  );

  nwProcess.on('close', () => {
    // define callback on close
  });

  nwProcess.on('error', () => {
    // define callback on error
  });

  return nwProcess;
}

export default run;
