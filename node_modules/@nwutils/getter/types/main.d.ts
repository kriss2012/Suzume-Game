export default get;
export type Options = {
    /**
     * Runtime version
     */
    version: string | "latest" | "stable" | "lts";
    /**
     * Build flavor
     */
    flavor: "normal" | "sdk";
    /**
     * Target platform
     */
    platform: "linux" | "osx" | "win";
    /**
     * Target architecture
     */
    arch: "ia32" | "x64" | "arm64";
    /**
     * Download server, accepts http and https
     */
    downloadUrl: "https://dl.nwjs.io";
    /**
     * Manifest URI, accepts file, http and https
     */
    manifestUrl: "https://nwjs.io/versions.json";
    /**
     * Cache directory
     */
    cacheDir: string;
    /**
     * If false, remove cache and redownload.
     */
    cache: boolean;
    /**
     * If true, ffmpeg is not downloaded.
     */
    ffmpeg: boolean;
    /**
     * If true, download node headers.
     */
    nativeAddon: boolean;
    /**
     * If true shasum is enabled, otherwise disabled.
     */
    shaSum: boolean;
};
/**
 * @typedef {object} Options
 * @property {string | "latest" | "stable" | "lts"} version                    Runtime version
 * @property {"normal" | "sdk"}                     flavor                     Build flavor
 * @property {"linux" | "osx" | "win"}              platform                   Target platform
 * @property {"ia32" | "x64" | "arm64"}             arch                       Target architecture
 * @property {"https://dl.nwjs.io"}                 downloadUrl                Download server, accepts http and https
 * @property {"https://nwjs.io/versions.json"}      manifestUrl                Manifest URI, accepts file, http and https
 * @property {string}                               cacheDir                   Cache directory
 * @property {boolean}                              cache                      If false, remove cache and redownload.
 * @property {boolean}                              ffmpeg                     If true, ffmpeg is not downloaded.
 * @property {boolean}                              nativeAddon                If true, download node headers.
 * @property {boolean}                              shaSum                     If true shasum is enabled, otherwise disabled.
 */
/**
 * Get NW.js and related binaries for Linux, MacOS and Windows.
 * @async
 * @function
 * @param  {Options}    options  Get mode options
 * @returns {Promise<void>}
 */
declare function get(options: Options): Promise<void>;
