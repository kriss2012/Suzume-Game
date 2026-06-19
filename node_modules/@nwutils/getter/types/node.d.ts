/**
 * Download NW.js's Node.js headers.
 * @async
 * @function
 * @param  {string}          downloadUrl  - Download server
 * @param  {string}          version      - Runtime version
 * @param  {string}          cacheDir     - Directory to store NW binaries
 * @throws {Error}                        - When download fails
 * @returns {Promise<string>}             - path of compressed file which contains the Node headers.
 */
export default function nw(downloadUrl: string, version: string, cacheDir: string): Promise<string>;
