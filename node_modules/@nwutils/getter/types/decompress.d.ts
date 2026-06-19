/**
 * Decompresses a file at `filePath` to `cacheDir` directory.
 * @async
 * @function
 * @param {string} filePath  - file path to compressed binary
 * @param {string} cacheDir  - directory to decompress into
 * @throws {Error}
 * @returns {Promise<void>}
 */
export default function decompress(filePath: string, cacheDir: string): Promise<void>;
