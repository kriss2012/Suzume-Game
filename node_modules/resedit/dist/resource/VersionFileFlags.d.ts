/**
 * Flag values used by VersionEntry.fixedInfo field.
 * Zero or more enum values are stored (with OR operator).
 */
declare const VersionFileFlags: {
    readonly Debug: 1;
    readonly Prerelease: 2;
    readonly Patched: 4;
    readonly PrivateBuild: 8;
    readonly InfoInferred: 16;
    readonly SpecialBuild: 32;
};
/**
 * Flag values used by VersionEntry.fixedInfo field.
 * Zero or more enum values are stored (with OR operator).
 */
type VersionFileFlags = (typeof VersionFileFlags)[keyof typeof VersionFileFlags];
export default VersionFileFlags;
