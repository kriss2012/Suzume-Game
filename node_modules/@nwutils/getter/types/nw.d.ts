/**
 * Download NW.js binary.
 * @async
 * @function
 * @param  {string}          downloadUrl  - Download server
 * @param  {string}          version      - Runtime version
 * @param  {string}          flavor       - Runtime build flavor
 * @param  {string}          platform     - NW supported platform
 * @param  {string}          arch         - NW supported architecture
 * @param  {string}          cacheDir     - Directory to store NW binaries
 * @throws {Error}                        - When download fails
 * @returns {Promise<string>}             - Path of compressed file which contains NW.js binaries.
 */
export default function nw(downloadUrl: string, version: string, flavor: string, platform: string, arch: string, cacheDir: string): Promise<string>;
