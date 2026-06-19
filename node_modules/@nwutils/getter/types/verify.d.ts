/**
 * Verify the SHA256 checksum of downloaded artifacts.
 * @async
 * @function
 * @param {string} shaUrl - URL to get the shasum text file from.
 * @param {string} shaOut - File path to shasum text file.
 * @param {string} cacheDir - File path to cache directory.
 * @param {boolean} ffmpeg - Toggle between community (true) and official (false) ffmpeg binary
 * @param {boolean} shaSum - Throws error if true, otherwise logs a warning.
 * @throws {Error}
 * @returns {Promise<boolean>} - Returns true if the checksums match.
 */
export default function verify(shaUrl: string, shaOut: string, cacheDir: string, ffmpeg: boolean, shaSum: boolean): Promise<boolean>;
