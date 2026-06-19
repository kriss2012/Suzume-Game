/**
 * OS values used by VersionEntry.fixedInfo field.
 */
declare const VersionFileOS: {
    readonly Unknown: 0;
    readonly _Windows16: 1;
    readonly _PM16: 2;
    readonly _PM32: 3;
    readonly _Windows32: 4;
    readonly DOS: 65536;
    readonly OS2_16: 131072;
    readonly OS2_32: 196608;
    readonly NT: 262144;
    readonly DOS_Windows16: 65537;
    readonly DOS_Windows32: 65540;
    readonly NT_Windows32: 262148;
    readonly OS2_16_PM16: 131074;
    readonly OS2_32_PM32: 196611;
};
/**
 * OS values used by VersionEntry.fixedInfo field.
 */
type VersionFileOS = (typeof VersionFileOS)[keyof typeof VersionFileOS];
export default VersionFileOS;
