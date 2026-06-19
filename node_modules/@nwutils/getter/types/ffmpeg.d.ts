/**
 * Download community FFmpeg binary from `https://github.com/nwjs-ffmpeg-prebuilt/nwjs-ffmpeg-prebuilt`.
 * @async
 * @function
 * @param  {string}          downloadUrl  - Download server
 * @param  {string}          version      - Runtime version
 * @param  {string}          platform     - NW supported platform
 * @param  {string}          arch         - NW supported architecture
 * @param  {string}          cacheDir     - Directory to store FFmpeg binary
 * @throws {Error}                        - When download fails
 * @returns {Promise<string>}             - Path of compressed file which containscommunity FFmpeg binary.
 */
export default function ffmpeg(downloadUrl: string, version: string, platform: string, arch: string, cacheDir: string): Promise<string>;
