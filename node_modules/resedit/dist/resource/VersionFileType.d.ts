/**
 * File type values used by VersionEntry.fixedInfo field.
 */
declare const VersionFileType: {
    readonly Unknown: 0;
    readonly App: 1;
    readonly DLL: 2;
    readonly Driver: 3;
    readonly Font: 4;
    readonly VxD: 5;
    readonly StaticLibrary: 7;
};
/**
 * File type values used by VersionEntry.fixedInfo field.
 */
type VersionFileType = (typeof VersionFileType)[keyof typeof VersionFileType];
export default VersionFileType;
